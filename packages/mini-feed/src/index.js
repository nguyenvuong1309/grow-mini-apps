// Standalone entry — used when running mini-feed in isolation for development
// (`pnpm start:standalone`). In federated mode (loaded by the host), this file
// isn't executed; the host imports `./FeedNavigator` directly via Module
// Federation.
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
        mini-feed
      </Text>
      <Text style={{textAlign: 'center', opacity: 0.7}}>
        This bundle is meant to be loaded by the grow host app via Module
        Federation. To preview the screen standalone, mount it through a host
        that provides the Redux store, theme, and auth state.
      </Text>
    </View>
  );
}

AppRegistry.registerComponent('mini-feed', () => StandalonePlaceholder);
