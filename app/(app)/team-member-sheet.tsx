import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Platform,
  SectionList,
  useColorScheme,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Search, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useSheetContext } from '@/lib/sheet-context';
import { type User, getAllUsers } from '@/lib/mock-data';
import { useAccentColors } from '@/lib/theme-context';
import { getIOSSheetColors } from '@/lib/ios-colors';

type UserSection = {
  title: string;
  data: User[];
};

const HEADER_PADDING = 16;
const ITEM_HEIGHT = 44;
const SECTION_HEADER_HEIGHT = 24;
const ALPHABET_TOUCH_WIDTH = 44;
const ALPHABET_VISUAL_WIDTH = 20;
const allUsers = getAllUsers();

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function groupUsersByLetter(users: User[]): UserSection[] {
  const grouped = new Map<string, User[]>();

  for (const user of users) {
    const letter = user.name.charAt(0).toUpperCase();
    if (!grouped.has(letter)) {
      grouped.set(letter, []);
    }
    grouped.get(letter)!.push(user);
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, data]) => ({ title, data }));
}

function getAvailableLetters(sections: UserSection[]): Set<string> {
  return new Set(sections.map((s) => s.title));
}

/**
 * Native iOS Team Member Sheet
 */
export default function TeamMemberSheet() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const isDark = colorScheme === 'dark';
  const sheetBackground = isDark ? '#1c1c1e' : '#f2f2f7';

  const { getTeamMemberData, clearTeamMemberData } = useSheetContext();
  const data = getTeamMemberData();

  const accentColors = useAccentColors();
  const accentColor = accentColors?.primary ?? '#007AFF';
  const sectionListRef = useRef<SectionList<User, UserSection>>(null);
  const lastHapticTime = useRef(0);

  const [search, setSearch] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<User[]>(data?.currentMembers ?? []);
  const [activeIndexLetter, setActiveIndexLetter] = useState<string | null>(null);
  const [listContainerHeight, setListContainerHeight] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (data?.currentMembers) {
      setSelectedMembers(data.currentMembers);
    }
  }, [data?.currentMembers]);

  const showAlphabet = !search;

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return allUsers;
    const query = search.toLowerCase();
    return allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [search]);

  const sections = useMemo(() => groupUsersByLetter(filteredUsers), [filteredUsers]);
  const availableLetters = useMemo(() => getAvailableLetters(sections), [sections]);

  const isSelected = useCallback(
    (userId: string) => selectedMembers.some((m) => m.id === userId),
    [selectedMembers]
  );

  const toggleMember = useCallback((user: User) => {
    setSelectedMembers((prev) =>
      prev.some((m) => m.id === user.id)
        ? prev.filter((m) => m.id !== user.id)
        : [...prev, user]
    );
  }, []);

  const removeMember = useCallback((userId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== userId));
  }, []);

  const handleSave = useCallback(() => {
    if (data?.onSave) {
      data.onSave(selectedMembers);
    }
    clearTeamMemberData();
    router.back();
  }, [selectedMembers, data, clearTeamMemberData, router]);

  const handleCancel = useCallback(() => {
    clearTeamMemberData();
    router.back();
  }, [clearTeamMemberData, router]);

  const scrollToLetter = useCallback(
    (letter: string) => {
      const sectionIndex = sections.findIndex((s) => s.title === letter);
      if (sectionIndex === -1 || !sectionListRef.current) return;

      try {
        sectionListRef.current.scrollToLocation({
          sectionIndex,
          itemIndex: 0,
          viewOffset: 0,
          animated: false,
        });
      } catch {
        // Ignore scroll failures
      }

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const now = Date.now();
        if (now - lastHapticTime.current >= 50) {
          lastHapticTime.current = now;
          Haptics.selectionAsync().catch(() => {});
        }
      }
    },
    [sections]
  );

  const handleAlphabetTouch = useCallback(
    (letter: string) => {
      setActiveIndexLetter(letter);
      if (availableLetters.has(letter)) {
        scrollToLetter(letter);
      }
    },
    [availableLetters, scrollToLetter]
  );

  const handleAlphabetRelease = useCallback(() => {
    setActiveIndexLetter(null);
  }, []);

  const roleLabel = data?.role === 'owners' ? 'Owners' : 'Assignees';

  const letterSize = useMemo(() => {
    if (listContainerHeight <= 0) return { height: 18, fontSize: 11 };
    const height = listContainerHeight / ALPHABET.length;
    const fontSize = Math.max(11, Math.min(12, height * 0.65));
    return { height, fontSize };
  }, [listContainerHeight]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: UserSection }) => (
      <View
        style={{
          height: SECTION_HEADER_HEIGHT,
          backgroundColor: sheetBackground,
          paddingHorizontal: 16,
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.subtitle }}>
          {section.title}
        </Text>
      </View>
    ),
    [sheetBackground, colors.subtitle]
  );

  const renderItem = useCallback(
    ({ item: user, index, section }: { item: User; index: number; section: UserSection }) => {
      const selected = isSelected(user.id);
      const isLast = index === section.data.length - 1;

      return (
        <View>
          <Pressable onPress={() => toggleMember(user)}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 16,
                paddingRight: 16,
                height: ITEM_HEIGHT,
                gap: 10,
                backgroundColor: sheetBackground,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                  }}
                >
                  {user.initials}
                </Text>
              </View>
              <Text style={{ flex: 1, fontSize: 15, color: colors.title }} numberOfLines={1}>
                {user.name}
              </Text>
              {selected ? <Icon as={Check} size={20} color={accentColor} /> : null}
            </View>
          </Pressable>
          {!isLast ? (
            <View
              style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: colors.separator,
                marginLeft: 16 + 32 + 10,
                marginRight: 0,
              }}
            />
          ) : null}
        </View>
      );
    },
    [isSelected, toggleMember, accentColor, sheetBackground, isDark, colors]
  );

  const keyExtractor = useCallback((item: User) => item.id, []);

  const onScrollToIndexFailed = useCallback(() => {}, []);

  const getItemLayout = useCallback(
    (data: UserSection[] | null, index: number) => {
      if (!data) return { length: ITEM_HEIGHT, offset: 0, index };

      let offset = 0;
      let currentIndex = 0;

      for (const section of data) {
        if (currentIndex === index) {
          return { length: SECTION_HEADER_HEIGHT, offset, index };
        }
        offset += SECTION_HEADER_HEIGHT;
        currentIndex++;

        for (let i = 0; i < section.data.length; i++) {
          if (currentIndex === index) {
            return { length: ITEM_HEIGHT, offset, index };
          }
          offset += ITEM_HEIGHT;
          currentIndex++;
        }
      }

      return { length: ITEM_HEIGHT, offset, index };
    },
    []
  );

  if (!isMounted) {
    return <View style={{ flex: 1, backgroundColor: sheetBackground }} />;
  }

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: sheetBackground, padding: 20 }}>
        <Text style={{ color: colors.subtitle }}>No data available</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: sheetBackground }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: HEADER_PADDING,
          paddingVertical: 10,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.separator,
        }}
      >
        <Pressable onPress={handleCancel} hitSlop={8} style={{ minWidth: 60 }}>
          <Text style={{ fontSize: 16, color: colors.subtitle }}>Cancel</Text>
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '600', color: colors.title }}>{roleLabel}</Text>
        <Pressable onPress={handleSave} hitSlop={8} style={{ minWidth: 60, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: accentColor }}>
            Done{selectedMembers.length > 0 ? ` (${selectedMembers.length})` : ''}
          </Text>
        </Pressable>
      </View>

      {/* Search and Selection Area */}
      <View style={{ flexDirection: 'column' }}>
        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            borderRadius: 10,
            marginHorizontal: HEADER_PADDING,
            marginTop: 8,
            marginBottom: 8,
            paddingHorizontal: 10,
            height: 36,
            gap: 8,
          }}
        >
          <Icon as={Search} size={16} color={colors.subtitle} />
          <TextInput
            placeholder="Search"
            placeholderTextColor={colors.subtitle}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            style={{ flex: 1, fontSize: 16, color: colors.title, paddingVertical: 0 }}
          />
          {search.length > 0 ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon as={X} size={12} color={isDark ? 'rgba(0, 0, 0, 0.6)' : '#fff'} />
              </View>
            </Pressable>
          ) : null}
        </View>

        {/* Selected Chips */}
        <View style={{ height: 44, justifyContent: 'center' }}>
        {selectedMembers.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: HEADER_PADDING, gap: 6, alignItems: 'center' }}
          >
            {selectedMembers.map((member) => (
              <Pressable
                key={member.id}
                onPress={() => removeMember(member.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: accentColors?.secondary ?? 'rgba(0, 122, 255, 0.15)',
                  paddingLeft: 3,
                  paddingRight: 8,
                  paddingVertical: 3,
                  borderRadius: 16,
                  gap: 5,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '600',
                      color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
                    }}
                  >
                    {member.initials}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '500', color: accentColor }}>
                  {member.name.split(' ')[0]}
                </Text>
                <Icon as={X} size={14} color={accentColor} />
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <Text
            style={{
              fontSize: 13,
              color: colors.subtitle,
              paddingHorizontal: HEADER_PADDING,
            }}
          >
            Tap to select
          </Text>
        )}
        </View>
      </View>

      {/* User List with Alphabet Index */}
      <View
        style={{ flex: 1 }}
        onLayout={(e) => setListContainerHeight(e.nativeEvent.layout.height)}
      >
        {sections.length === 0 ? (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 15, color: colors.subtitle }}>No results found</Text>
          </View>
        ) : (
          <View style={{ flex: 1, marginRight: showAlphabet ? ALPHABET_TOUCH_WIDTH : 0 }}>
            <SectionList
              ref={sectionListRef}
              sections={sections}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              renderSectionHeader={renderSectionHeader}
              getItemLayout={getItemLayout as any}
              stickySectionHeadersEnabled
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              onScrollToIndexFailed={onScrollToIndexFailed}
            />
          </View>
        )}

        {/* Alphabet Index */}
        {showAlphabet && sections.length > 0 ? (
          <View
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: ALPHABET_TOUCH_WIDTH,
              justifyContent: 'center',
              zIndex: 10,
              backgroundColor: 'transparent',
            }}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={(e) => {
              const y = e.nativeEvent.locationY;
              const index = Math.floor((y / listContainerHeight) * ALPHABET.length);
              if (index >= 0 && index < ALPHABET.length) {
                handleAlphabetTouch(ALPHABET[index]);
              }
            }}
            onResponderMove={(e) => {
              const y = e.nativeEvent.locationY;
              const index = Math.floor((y / listContainerHeight) * ALPHABET.length);
              if (index >= 0 && index < ALPHABET.length) {
                handleAlphabetTouch(ALPHABET[index]);
              }
            }}
            onResponderRelease={handleAlphabetRelease}
          >
            {ALPHABET.map((letter) => {
              const isAvailable = availableLetters.has(letter);
              const isActive = activeIndexLetter === letter;

              return (
                <View
                  key={letter}
                  style={{
                    height: letterSize.height,
                    width: ALPHABET_TOUCH_WIDTH,
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingRight: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: letterSize.fontSize,
                      fontWeight: isActive ? '700' : '600',
                      color: isActive
                        ? accentColor
                        : isAvailable
                          ? colors.subtitle
                          : isDark
                            ? 'rgba(255, 255, 255, 0.2)'
                            : 'rgba(0, 0, 0, 0.15)',
                      minWidth: ALPHABET_VISUAL_WIDTH,
                      textAlign: 'center',
                    }}
                  >
                    {letter}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}
