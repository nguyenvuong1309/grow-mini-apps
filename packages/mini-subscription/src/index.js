// Standalone entry — not used in federated mode. See mini-squad-chat for
// the rationale; the host imports ./SubscriptionNavigator directly via
// Module Federation.
import {AppRegistry, View, Text} from 'react-native';

function StandalonePlaceholder() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
      <Text style={{fontSize: 18, fontWeight: '600', marginBottom: 8}}>
        mini-subscription
      </Text>
      <Text style={{textAlign: 'center', opacity: 0.7}}>
        Run this through the grow host app via Module Federation.
      </Text>
    </View>
  );
}

AppRegistry.registerComponent('mini-subscription', () => StandalonePlaceholder);
