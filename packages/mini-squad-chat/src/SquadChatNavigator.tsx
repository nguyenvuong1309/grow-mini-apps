import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SquadChatScreen } from './screens/SquadChatScreen';

// Stack of one — kept as a navigator (not a plain screen) so the host can
// embed it directly in any parent navigator without leaking nav configuration
// (header style, back button) up to the host.
export type SquadChatStackParamList = {
  'Squad.Chat': { squadId: string };
};

const Stack = createNativeStackNavigator<SquadChatStackParamList>();

interface SquadChatNavigatorProps {
  /** Initial squad to render. Falls back to route params when omitted. */
  squadId?: string;
}

export default function SquadChatNavigator({
  squadId,
}: SquadChatNavigatorProps) {
  useEffect(() => {
    // Hook for future side effects on mount (e.g. analytics tag).
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Squad.Chat"
        component={SquadChatScreen}
        initialParams={squadId ? { squadId } : undefined}
      />
    </Stack.Navigator>
  );
}
