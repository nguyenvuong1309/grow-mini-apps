import {getHostSDK} from '@grow/host-sdk';
import type {SupabaseClient} from '@supabase/supabase-js';
import {ReactionEmoji} from '../types';
import type {Comment, FeedPost} from '../types';

// The mini-app does NOT own a Supabase client: it borrows the host's
// authenticated singleton via the Host SDK. Resolve it lazily (inside function
// bodies only) so module evaluation never depends on SDK readiness.
const getDb = (): SupabaseClient => getHostSDK().data.getClient();

const PAGE_SIZE = 20;

/**
 * Shared helper: given raw checkins rows and the current user id,
 * fetches profiles, challenge info, reactions, and comments then
 * assembles full FeedPost objects.
 */
async function assembleCheckins(
  checkins: any[],
  userId: string,
): Promise<FeedPost[]> {
  const supabase = getDb();
  if (!checkins || checkins.length === 0) {
    return [];
  }

  // Fetch profiles for all checkin user IDs
  const userIds = [...new Set(checkins.map(c => c.user_id))];
  const {data: profiles} = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));

  // Fetch challenge names and categories
  const uniqueChallengeIds = [...new Set(checkins.map(c => c.challenge_id))];
  const {data: challenges} = await supabase
    .from('challenges')
    .select('id, name, category')
    .in('id', uniqueChallengeIds);

  const challengeMap = new Map(
    (challenges ?? []).map(ch => [
      ch.id,
      {name: ch.name, category: ch.category},
    ]),
  );

  // Fetch reaction counts for all checkins
  const checkinIds = checkins.map(c => c.id);
  const {data: reactions} = await supabase
    .from('reactions')
    .select('checkin_id, emoji')
    .in('checkin_id', checkinIds);

  // Build reaction counts per checkin
  const reactionCounts = new Map<
    string,
    {fire: number; muscle: number; clap: number}
  >();
  for (const r of reactions ?? []) {
    const existing = reactionCounts.get(r.checkin_id) ?? {
      fire: 0,
      muscle: 0,
      clap: 0,
    };
    const emoji = r.emoji as ReactionEmoji;
    if (emoji === ReactionEmoji.FIRE) {
      existing.fire += 1;
    } else if (emoji === ReactionEmoji.MUSCLE) {
      existing.muscle += 1;
    } else if (emoji === ReactionEmoji.CLAP) {
      existing.clap += 1;
    }
    reactionCounts.set(r.checkin_id, existing);
  }

  // Fetch user's own reactions
  const {data: userReactions} = await supabase
    .from('reactions')
    .select('checkin_id, emoji')
    .eq('user_id', userId)
    .in('checkin_id', checkinIds);

  const userReactionMap = new Map<string, ReactionEmoji>(
    (userReactions ?? []).map(r => [r.checkin_id, r.emoji as ReactionEmoji]),
  );

  // Fetch comment counts
  const {data: commentRows} = await supabase
    .from('comments')
    .select('checkin_id')
    .in('checkin_id', checkinIds);

  const commentCounts = new Map<string, number>();
  for (const c of commentRows ?? []) {
    commentCounts.set(c.checkin_id, (commentCounts.get(c.checkin_id) ?? 0) + 1);
  }

  // Assemble FeedPost objects
  return checkins.map(checkin => {
    const challengeInfo = challengeMap.get(checkin.challenge_id);
    return {
      ...checkin,
      profile: profileMap.get(checkin.user_id) ?? {
        id: checkin.user_id,
        display_name: 'Unknown',
        username: null,
        avatar_url: null,
        bio: '',
        level: 0,
        xp: 0,
        points_balance: 0,
        subscription_tier: 'free',
        timezone: 'UTC',
        onboarding_completed: false,
        created_at: '',
        updated_at: '',
      },
      challenge_name: challengeInfo?.name ?? 'Unknown Challenge',
      challenge_category: challengeInfo?.category ?? 'custom',
      reactions_count: reactionCounts.get(checkin.id) ?? {
        fire: 0,
        muscle: 0,
        clap: 0,
      },
      user_reaction: userReactionMap.get(checkin.id) ?? null,
      comments_count: commentCounts.get(checkin.id) ?? 0,
    } as unknown as FeedPost;
  });
}

export const feedService = {
  async getFeed(page: number): Promise<FeedPost[]> {
    const supabase = getDb();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get challenge IDs the user is a member of
    const {data: memberships, error: memberError} = await supabase
      .from('challenge_members')
      .select('challenge_id')
      .eq('user_id', user.id)
      .eq('status', 'active' as const);

    if (memberError) {
      throw memberError;
    }

    if (!memberships || memberships.length === 0) {
      return [];
    }

    const challengeIds = memberships.map(m => m.challenge_id);

    // Get verified checkins from those challenges
    const {data: checkins, error: checkinError} = await supabase
      .from('checkins')
      .select('*')
      .in('challenge_id', challengeIds)
      .eq('status', 'verified' as const)
      .order('created_at', {ascending: false})
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (checkinError) {
      throw checkinError;
    }

    return assembleCheckins(checkins ?? [], user.id);
  },

  async getFollowingFeed(page: number): Promise<FeedPost[]> {
    const supabase = getDb();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get user IDs the current user follows
    const {data: followRows, error: followError} = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    if (followError) {
      throw followError;
    }

    if (!followRows || followRows.length === 0) {
      return [];
    }

    const followingIds = followRows.map(f => f.following_id);

    // Get verified checkins from followed users
    const {data: checkins, error: checkinError} = await supabase
      .from('checkins')
      .select('*')
      .in('user_id', followingIds)
      .eq('status', 'verified' as const)
      .order('created_at', {ascending: false})
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (checkinError) {
      throw checkinError;
    }

    return assembleCheckins(checkins ?? [], user.id);
  },

  async getMyFeed(page: number): Promise<FeedPost[]> {
    const supabase = getDb();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get verified checkins from the current user only
    const {data: checkins, error: checkinError} = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'verified' as const)
      .order('created_at', {ascending: false})
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (checkinError) {
      throw checkinError;
    }

    return assembleCheckins(checkins ?? [], user.id);
  },

  async getPostDetail(checkinId: string): Promise<FeedPost> {
    const supabase = getDb();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      throw new Error('Not authenticated');
    }

    const {data: checkin, error} = await supabase
      .from('checkins')
      .select('*')
      .eq('id', checkinId)
      .single();

    if (error) {
      throw error;
    }

    // Fetch profile, challenge, reactions, user reaction, and comment count
    // concurrently — they are independent queries once the checkin row is known.
    const [
      {data: profile},
      {data: challenge},
      {data: reactions},
      {data: userReaction},
      {data: commentRows},
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', checkin.user_id).single(),
      supabase
        .from('challenges')
        .select('id, name, category')
        .eq('id', checkin.challenge_id)
        .single(),
      supabase.from('reactions').select('emoji').eq('checkin_id', checkinId),
      supabase
        .from('reactions')
        .select('emoji')
        .eq('checkin_id', checkinId)
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase.from('comments').select('id').eq('checkin_id', checkinId),
    ]);

    const counts = {fire: 0, muscle: 0, clap: 0};
    for (const r of reactions ?? []) {
      const emoji = r.emoji as ReactionEmoji;
      if (emoji === ReactionEmoji.FIRE) {
        counts.fire += 1;
      } else if (emoji === ReactionEmoji.MUSCLE) {
        counts.muscle += 1;
      } else if (emoji === ReactionEmoji.CLAP) {
        counts.clap += 1;
      }
    }

    return {
      ...checkin,
      profile: profile ?? {
        id: checkin.user_id,
        display_name: 'Unknown',
        username: null,
        avatar_url: null,
        bio: '',
        level: 0,
        xp: 0,
        points_balance: 0,
        subscription_tier: 'free',
        timezone: 'UTC',
        onboarding_completed: false,
        created_at: '',
        updated_at: '',
      },
      challenge_name: challenge?.name ?? 'Unknown Challenge',
      challenge_category: challenge?.category ?? 'custom',
      reactions_count: counts,
      user_reaction: userReaction
        ? (userReaction.emoji as ReactionEmoji)
        : null,
      comments_count: commentRows?.length ?? 0,
    } as unknown as FeedPost;
  },

  async addReaction(checkinId: string, emoji: ReactionEmoji): Promise<void> {
    const supabase = getDb();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check if user already reacted with this emoji (toggle behavior)
    const {data: existing} = await supabase
      .from('reactions')
      .select('id')
      .eq('checkin_id', checkinId)
      .eq('user_id', user.id)
      .eq('emoji', emoji)
      .maybeSingle();

    if (existing) {
      // Remove existing reaction (toggle off)
      const {error} = await supabase
        .from('reactions')
        .delete()
        .eq('id', existing.id);

      if (error) {
        throw error;
      }
    } else {
      // Remove any other reaction by this user on this checkin first
      await supabase
        .from('reactions')
        .delete()
        .eq('checkin_id', checkinId)
        .eq('user_id', user.id);

      // Insert new reaction
      const {error} = await supabase.from('reactions').insert({
        checkin_id: checkinId,
        user_id: user.id,
        emoji,
      });

      if (error) {
        throw error;
      }
    }
  },

  async removeReaction(checkinId: string, emoji: ReactionEmoji): Promise<void> {
    const supabase = getDb();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      throw new Error('Not authenticated');
    }

    const {error} = await supabase
      .from('reactions')
      .delete()
      .eq('checkin_id', checkinId)
      .eq('user_id', user.id)
      .eq('emoji', emoji);

    if (error) {
      throw error;
    }
  },

  async getComments(checkinId: string, page: number): Promise<Comment[]> {
    const supabase = getDb();
    const {data, error} = await supabase
      .from('comments')
      .select('*')
      .eq('checkin_id', checkinId)
      .order('created_at', {ascending: true})
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Fetch profiles for comment authors
    const userIds = [...new Set(data.map(c => c.user_id))];
    const {data: profiles} = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));

    return data.map(comment => ({
      ...comment,
      profile: profileMap.get(comment.user_id) ?? undefined,
    })) as unknown as Comment[];
  },

  subscribeToFeed(
    onNewCheckin: (payload: {new: Record<string, unknown>}) => void,
  ) {
    const supabase = getDb();
    const channel = supabase
      .channel('feed-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'checkins',
          filter: 'status=eq.verified',
        },
        payload => {
          onNewCheckin(payload as {new: Record<string, unknown>});
        },
      )
      .subscribe();

    return channel;
  },

  unsubscribeFromFeed(channel: ReturnType<SupabaseClient['channel']>) {
    const supabase = getDb();
    supabase.removeChannel(channel);
  },

  async addComment(
    checkinId: string,
    body: string,
    parentId?: string,
  ): Promise<Comment> {
    const supabase = getDb();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      throw new Error('Not authenticated');
    }

    const {data, error} = await supabase
      .from('comments')
      .insert({
        checkin_id: checkinId,
        user_id: user.id,
        body,
        parent_id: parentId ?? null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Fetch the commenter's profile
    const {data: profile} = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      ...data,
      profile: profile ?? undefined,
    } as unknown as Comment;
  },
};
