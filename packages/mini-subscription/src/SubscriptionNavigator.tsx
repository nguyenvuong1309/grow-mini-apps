import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SubscriptionPlansScreen} from './screens/SubscriptionPlansScreen';
import {CosmeticShopScreen} from './screens/CosmeticShopScreen';

// Routes mirror the host's `SubscriptionStackParamList`; nothing the host
// already imports or navigates to needs to change.
export type SubscriptionStackParamList = {
  'Subscription.Plans': undefined;
  'Subscription.CosmeticShop': undefined;
};

const Stack = createNativeStackNavigator<SubscriptionStackParamList>();

export default function SubscriptionNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="Subscription.Plans"
        component={SubscriptionPlansScreen}
      />
      <Stack.Screen
        name="Subscription.CosmeticShop"
        component={CosmeticShopScreen}
      />
    </Stack.Navigator>
  );
}
