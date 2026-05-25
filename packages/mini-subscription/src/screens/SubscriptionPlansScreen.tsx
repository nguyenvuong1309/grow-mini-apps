import React, {useCallback, useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../local/theme';
import {
  SubscriptionTier,
  selectTier,
  selectIsPurchasing,
  purchaseRequest,
} from '../local/state';

type BillingCycle = 'monthly' | 'yearly';

interface PlanConfig {
  tier: SubscriptionTier;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

const PLANS: PlanConfig[] = [
  {
    tier: SubscriptionTier.FREE,
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ['3 active challenges', 'Basic stats', '1 squad'],
  },
  {
    tier: SubscriptionTier.PRO,
    name: 'Pro',
    monthlyPrice: 4.99,
    yearlyPrice: 49.9,
    features: [
      'Unlimited challenges',
      'Advanced analytics',
      'Custom badges',
      'Priority support',
    ],
  },
  {
    tier: SubscriptionTier.SQUAD_PRO,
    name: 'Squad Pro',
    monthlyPrice: 9.99,
    yearlyPrice: 99.9,
    features: [
      'Everything in Pro',
      'Unlimited squads',
      'Squad analytics',
      'Custom squad badges',
    ],
  },
];

const TIER_RANK: Record<string, number> = {
  [SubscriptionTier.FREE]: 0,
  [SubscriptionTier.PRO]: 1,
  [SubscriptionTier.SQUAD_PRO]: 2,
};

export function SubscriptionPlansScreen() {
  const t = useTheme();
  const {colors: c, spacing: s, borderRadius: br} = t;
  const dispatch = useDispatch();
  const currentTier = useSelector(selectTier);
  const isPurchasing = useSelector(selectIsPurchasing);
  const [billing, setBilling] = useState<BillingCycle>('monthly');

  const handleUpgrade = useCallback(
    (plan: PlanConfig) => {
      const price =
        billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
      const period = billing === 'monthly' ? 'month' : 'year';

      Alert.alert(
        'Confirm Subscription',
        `Subscribe to ${plan.name} for $${price.toFixed(2)}/${period}?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Subscribe',
            onPress: () => {
              dispatch(purchaseRequest(plan.tier));
            },
          },
        ],
      );
    },
    [dispatch, billing],
  );

  const formatPrice = (plan: PlanConfig) => {
    if (plan.monthlyPrice === 0) return 'Free';
    const price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const period = billing === 'monthly' ? '/mo' : '/yr';
    return `$${price.toFixed(2)}${period}`;
  };

  const isCurrent = (tier: SubscriptionTier) => tier === currentTier;
  const isUpgrade = (tier: SubscriptionTier) =>
    TIER_RANK[tier]! > TIER_RANK[currentTier]!;

  const renderHeader = () => (
    <View>
      <Text style={[styles.h2, {color: c.text, marginBottom: s.sm}]}>
        Choose Your Plan
      </Text>
      <Text style={{color: c.textSecondary, marginBottom: s.lg, fontSize: 14}}>
        Unlock more features to supercharge your growth
      </Text>

      <View
        style={[
          styles.toggleRow,
          {
            backgroundColor: c.surface,
            borderRadius: br.full,
            padding: 4,
            marginBottom: s.xl,
          },
        ]}>
        {(['monthly', 'yearly'] as BillingCycle[]).map(cycle => (
          <Pressable
            key={cycle}
            onPress={() => setBilling(cycle)}
            style={[
              styles.toggleOption,
              {
                backgroundColor: billing === cycle ? c.primary : 'transparent',
                borderRadius: br.full,
              },
            ]}>
            <Text
              style={{
                color: billing === cycle ? c.textInverse : c.textSecondary,
                fontWeight: '600',
                fontSize: 14,
              }}>
              {cycle === 'monthly' ? 'Monthly' : 'Yearly'}
            </Text>
            {cycle === 'yearly' && (
              <Text
                style={{
                  color: billing === cycle ? c.textInverse : c.primary,
                  fontWeight: '600',
                  fontSize: 12,
                  marginLeft: 4,
                }}>
                Save 2 months
              </Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderPlan = ({item: plan}: {item: PlanConfig}) => {
    const current = isCurrent(plan.tier);
    const upgrade = isUpgrade(plan.tier);

    return (
      <View
        testID={`plan-${
          plan.tier === SubscriptionTier.FREE
            ? 'free'
            : plan.tier === SubscriptionTier.PRO
              ? 'pro'
              : 'squad-pro'
        }`}
        style={[
          styles.card,
          {
            backgroundColor: c.surface,
            borderRadius: br.lg,
            padding: s.base,
            marginBottom: s.base,
            ...(current ? {borderColor: c.primary, borderWidth: 2} : {}),
          },
        ]}>
        <View style={[styles.planHeader, {marginBottom: s.base}]}>
          <View>
            <Text style={[styles.h3, {color: c.text}]}>{plan.name}</Text>
            {current && (
              <Text style={{color: c.primary, fontSize: 12, fontWeight: '600'}}>
                Current Plan
              </Text>
            )}
          </View>
          <Text style={[styles.h2, {color: c.primary}]}>
            {formatPrice(plan)}
          </Text>
        </View>

        {plan.features.map(feature => (
          <View key={feature} style={[styles.featureRow, {marginBottom: s.xs}]}>
            <Text style={{color: c.success, marginRight: s.sm, fontSize: 16}}>
              ✓
            </Text>
            <Text style={{color: c.text, fontSize: 16}}>{feature}</Text>
          </View>
        ))}

        {upgrade && (
          <Pressable
            testID={`upgrade-${
              plan.tier === SubscriptionTier.PRO ? 'pro' : 'squad-pro'
            }-btn`}
            onPress={() => handleUpgrade(plan)}
            disabled={isPurchasing}
            style={[
              styles.button,
              {
                backgroundColor: c.primary,
                borderRadius: br.md,
                marginTop: s.base,
                opacity: isPurchasing ? 0.6 : 1,
              },
            ]}>
            {isPurchasing ? (
              <ActivityIndicator color={c.textInverse} />
            ) : (
              <Text
                style={{
                  color: c.textInverse,
                  fontWeight: '600',
                  fontSize: 16,
                }}>
                {`Upgrade to ${plan.name}`}
              </Text>
            )}
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      testID="subscription-screen"
      style={{flex: 1, backgroundColor: c.background}}>
      <FlatList
        data={PLANS}
        keyExtractor={plan => plan.tier}
        renderItem={renderPlan}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<View style={{height: s.xl}} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{padding: s.base}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h2: {fontSize: 24, fontWeight: '700'},
  h3: {fontSize: 20, fontWeight: '700'},
  toggleRow: {flexDirection: 'row'},
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  card: {borderWidth: 0},
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featureRow: {flexDirection: 'row', alignItems: 'center'},
  button: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
