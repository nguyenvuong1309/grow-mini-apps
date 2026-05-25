import React, {useCallback, useState} from 'react';
import {View, FlatList, StyleSheet, Alert, Text, Pressable} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {useTheme} from '../local/theme';
import {selectPointsBalance} from '../local/state';

type CosmeticCategory = 'all' | 'themes' | 'frames' | 'borders';

interface CosmeticItem {
  id: string;
  name: string;
  category: 'themes' | 'frames' | 'borders';
  price: number;
  preview: string;
  owned: boolean;
}

const FILTER_TABS: {key: CosmeticCategory; label: string}[] = [
  {key: 'all', label: 'All'},
  {key: 'themes', label: 'Themes'},
  {key: 'frames', label: 'Frames'},
  {key: 'borders', label: 'Borders'},
];

const MOCK_ITEMS: CosmeticItem[] = [
  {
    id: '1',
    name: 'Midnight Blue',
    category: 'themes',
    price: 500,
    preview: '🌙',
    owned: false,
  },
  {
    id: '2',
    name: 'Sunset Orange',
    category: 'themes',
    price: 500,
    preview: '🌅',
    owned: true,
  },
  {
    id: '3',
    name: 'Forest Green',
    category: 'themes',
    price: 750,
    preview: '🌲',
    owned: false,
  },
  {
    id: '4',
    name: 'Gold Crown',
    category: 'frames',
    price: 1000,
    preview: '👑',
    owned: false,
  },
  {
    id: '5',
    name: 'Diamond',
    category: 'frames',
    price: 1500,
    preview: '💎',
    owned: false,
  },
  {
    id: '6',
    name: 'Fire Ring',
    category: 'frames',
    price: 800,
    preview: '🔥',
    owned: true,
  },
  {
    id: '7',
    name: 'Neon Glow',
    category: 'borders',
    price: 600,
    preview: '✨',
    owned: false,
  },
  {
    id: '8',
    name: 'Rainbow',
    category: 'borders',
    price: 900,
    preview: '🌈',
    owned: false,
  },
];

export function CosmeticShopScreen() {
  const t = useTheme();
  const {colors: c, spacing: s, borderRadius: br} = t;
  const balance = useSelector(selectPointsBalance);
  const [activeFilter, setActiveFilter] = useState<CosmeticCategory>('all');
  const [items, setItems] = useState<CosmeticItem[]>(MOCK_ITEMS);

  const filteredItems =
    activeFilter === 'all'
      ? items
      : items.filter(item => item.category === activeFilter);

  const handleBuy = useCallback(
    (item: CosmeticItem) => {
      if (item.owned) return;
      if (balance < item.price) {
        Alert.alert(
          'Insufficient Points',
          'You do not have enough points for this item.',
        );
        return;
      }
      Alert.alert(
        'Confirm Purchase',
        `Buy ${item.name} for ${item.price} points?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Buy',
            onPress: () => {
              setItems(prev =>
                prev.map(i => (i.id === item.id ? {...i, owned: true} : i)),
              );
            },
          },
        ],
      );
    },
    [balance],
  );

  const renderItem = ({item}: {item: CosmeticItem}) => (
    <View
      style={[
        styles.itemCard,
        {
          backgroundColor: c.surface,
          borderRadius: br.lg,
          padding: s.base,
          margin: s.xs,
          flex: 1,
        },
      ]}>
      <View style={[styles.previewContainer, {marginBottom: s.sm}]}>
        <Text style={{fontSize: 40, textAlign: 'center'}}>{item.preview}</Text>
      </View>
      <Text
        numberOfLines={1}
        style={{color: c.text, fontWeight: '600', fontSize: 14}}>
        {item.name}
      </Text>
      <View style={[styles.priceRow, {marginTop: s.xs}]}>
        {item.owned ? (
          <View
            style={{
              backgroundColor: c.successLight,
              borderRadius: br.md,
              paddingHorizontal: s.sm,
              paddingVertical: 2,
            }}>
            <Text style={{color: c.success, fontWeight: '600', fontSize: 12}}>
              Owned
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={() => handleBuy(item)}
            style={{
              backgroundColor: c.primary,
              borderRadius: br.md,
              paddingHorizontal: s.sm,
              paddingVertical: 4,
            }}>
            <Text
              style={{
                color: c.textInverse,
                fontWeight: '600',
                fontSize: 12,
              }}>
              {item.price} pts
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      testID="cosmetic-shop-screen"
      style={{flex: 1, backgroundColor: c.background, padding: s.base}}>
      <Text
        style={{
          color: c.text,
          fontSize: 24,
          fontWeight: '700',
          marginBottom: s.sm,
        }}>
        Cosmetic Shop
      </Text>

      <View
        style={[
          styles.balanceBar,
          {
            backgroundColor: c.surface,
            borderRadius: br.lg,
            padding: s.base,
            marginBottom: s.base,
          },
        ]}>
        <Text style={{color: c.textSecondary, fontSize: 14}}>Your Balance</Text>
        <Text style={{color: c.pointsGold, fontSize: 20, fontWeight: '700'}}>
          {balance.toLocaleString()} pts
        </Text>
      </View>

      <View
        testID="cosmetic-filter"
        style={[styles.tabs, {marginBottom: s.base}]}>
        {FILTER_TABS.map(tab => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveFilter(tab.key)}
            style={[
              styles.tab,
              {
                backgroundColor:
                  activeFilter === tab.key ? c.primary : c.surface,
                borderRadius: br.full,
              },
            ]}>
            <Text
              style={{
                color:
                  activeFilter === tab.key ? c.textInverse : c.textSecondary,
                fontWeight: '600',
                fontSize: 14,
              }}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        testID="cosmetics-grid"
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{height: s.xl}} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  balanceBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabs: {flexDirection: 'row', gap: 8},
  tab: {paddingHorizontal: 16, paddingVertical: 6},
  itemCard: {alignItems: 'center'},
  previewContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceRow: {alignItems: 'center'},
});
