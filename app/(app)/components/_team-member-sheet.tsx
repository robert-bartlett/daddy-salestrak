import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Pressable, ScrollView, TextInput, StyleSheet, Platform } from 'react-native';
import { Check, Search, X } from 'lucide-react-native';
import { BottomSheetSectionList, type BottomSheetSectionListMethods } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';

import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { BottomSheetModal } from '@/components/ui/bottom-sheet';
import { type User, getAllUsers } from '@/lib/mock-data';
import { useAccentColors } from '@/lib/theme-context';

type TeamRole = 'owners' | 'assignees';

type TeamMemberSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: TeamRole;
  currentMembers: User[];
  onSave: (members: User[]) => void;
  projectName: string;
};

type UserSection = {
  title: string;
  data: User[];
};

const HEADER_PADDING = 16;
const ITEM_HEIGHT = 44;
const SECTION_HEADER_HEIGHT = 28;
const allUsers = getAllUsers();

// Pre-compute alphabet for the index
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Group users by first letter of their name
function groupUsersByLetter(users: User[]): UserSection[] {
  const grouped = new Map<string, User[]>();

  for (const user of users) {
    const letter = user.name.charAt(0).toUpperCase();
    if (!grouped.has(letter)) {
      grouped.set(letter, []);
    }
    grouped.get(letter)!.push(user);
  }

  // Convert to array and sort by letter
  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, data]) => ({ title, data }));
}

// Get letters that have users
function getAvailableLetters(sections: UserSection[]): Set<string> {
  return new Set(sections.map((s) => s.title));
}

export function TeamMemberSheet({
  open,
  onOpenChange,
  role,
  currentMembers,
  onSave,
}: TeamMemberSheetProps) {
  const [search, setSearch] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<User[]>(currentMembers);
  const [activeIndexLetter, setActiveIndexLetter] = useState<string | null>(null);
  const [alphabetHeight, setAlphabetHeight] = useState(0);
  const accentColors = useAccentColors();
  const accentColor = accentColors?.primary ?? '#007AFF';
  const sectionListRef = useRef<BottomSheetSectionListMethods>(null);
  const lastHapticTime = useRef(0);

  // Calculate letter height based on available space
  const letterHeight = alphabetHeight > 0 ? alphabetHeight / ALPHABET.length : 14;

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return allUsers;
    const query = search.toLowerCase();
    return allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [search]);

  // Group filtered users into sections
  const sections = useMemo(() => groupUsersByLetter(filteredUsers), [filteredUsers]);

  // Get available letters for highlighting the alphabet index
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
    onSave(selectedMembers);
    onOpenChange(false);
  }, [selectedMembers, onSave, onOpenChange]);

  const handleCancel = useCallback(() => {
    setSelectedMembers(currentMembers);
    setSearch('');
    onOpenChange(false);
  }, [currentMembers, onOpenChange]);

  useEffect(() => {
    if (open) {
      setSelectedMembers(currentMembers);
      setSearch('');
    }
  }, [open, currentMembers]);

  // Scroll to section when alphabet letter is pressed
  const scrollToLetter = useCallback(
    (letter: string) => {
      const sectionIndex = sections.findIndex((s) => s.title === letter);
      if (sectionIndex !== -1 && sectionListRef.current) {
        sectionListRef.current.scrollToLocation({
          sectionIndex,
          itemIndex: 0,
          animated: false,
          viewOffset: 0,
        });

        // Haptic feedback (throttled)
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          const now = Date.now();
          if (now - lastHapticTime.current >= 50) {
            lastHapticTime.current = now;
            Haptics.selectionAsync().catch(() => {});
          }
        }
      }
    },
    [sections]
  );

  // Handle alphabet index touch/drag
  const handleAlphabetTouch = useCallback(
    (letter: string) => {
      if (availableLetters.has(letter)) {
        setActiveIndexLetter(letter);
        scrollToLetter(letter);
      }
    },
    [availableLetters, scrollToLetter]
  );

  const handleAlphabetRelease = useCallback(() => {
    setActiveIndexLetter(null);
  }, []);

  const roleLabel = role === 'owners' ? 'Owners' : 'Assignees';

  // Render section header
  const renderSectionHeader = useCallback(
    ({ section }: { section: UserSection }) => (
      <View
        style={{
          height: SECTION_HEADER_HEIGHT,
          backgroundColor: '#161618',
          paddingHorizontal: 16,
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255, 255, 255, 0.5)' }}>
          {section.title}
        </Text>
      </View>
    ),
    []
  );

  // Render user item
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
                paddingHorizontal: 16,
                height: ITEM_HEIGHT,
                gap: 10,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)' }}>
                  {user.initials}
                </Text>
              </View>
              <Text style={{ flex: 1, fontSize: 15, color: '#fff' }}>{user.name}</Text>
              {selected ? <Icon as={Check} size={18} color={accentColor} /> : null}
            </View>
          </Pressable>
          {!isLast && (
            <View
              style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                marginLeft: 16 + 32 + 10,
              }}
            />
          )}
        </View>
      );
    },
    [isSelected, toggleMember, accentColor]
  );

  const keyExtractor = useCallback((item: User) => item.id, []);

  // Calculate item layout for optimized scrolling
  const getItemLayout = useCallback(
    (data: UserSection[] | null, index: number) => {
      if (!data) return { length: ITEM_HEIGHT, offset: 0, index };

      let offset = 0;
      let itemCount = 0;

      for (const section of data) {
        // Add section header height
        if (itemCount === index) {
          return { length: SECTION_HEADER_HEIGHT, offset, index };
        }
        offset += SECTION_HEADER_HEIGHT;
        itemCount++;

        // Add items in section
        for (let i = 0; i < section.data.length; i++) {
          if (itemCount === index) {
            return { length: ITEM_HEIGHT, offset, index };
          }
          offset += ITEM_HEIGHT;
          itemCount++;
        }
      }

      return { length: ITEM_HEIGHT, offset, index };
    },
    []
  );

  return (
    <BottomSheetModal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={['70%', '92%']}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: HEADER_PADDING,
          paddingVertical: 10,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <Pressable onPress={handleCancel} hitSlop={8} style={{ minWidth: 60 }}>
          <Text style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)' }}>Cancel</Text>
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '600', color: '#fff' }}>{roleLabel}</Text>
        <Pressable onPress={handleSave} hitSlop={8} style={{ minWidth: 60, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: accentColor }}>
            Done{selectedMembers.length > 0 ? ` (${selectedMembers.length})` : ''}
          </Text>
        </Pressable>
      </View>

      {/* Sticky Search and Chips */}
      <View style={{ backgroundColor: '#161618' }}>
        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 10,
            marginHorizontal: HEADER_PADDING,
            marginTop: 8,
            paddingHorizontal: 10,
            height: 34,
            gap: 8,
          }}
        >
          <Icon as={Search} size={16} color="rgba(255, 255, 255, 0.4)" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            style={{ flex: 1, fontSize: 15, color: '#fff', paddingVertical: 0 }}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon as={X} size={12} color="rgba(0, 0, 0, 0.6)" />
              </View>
            </Pressable>
          )}
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
                    <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)' }}>
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
            <Text style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.25)', paddingHorizontal: HEADER_PADDING }}>
              Tap to select
            </Text>
          )}
        </View>
      </View>

      {/* User List with Alphabet Index */}
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Section List */}
        <View style={{ flex: 1 }}>
          {sections.length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Text style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.4)' }}>No results found</Text>
            </View>
          ) : (
            <BottomSheetSectionList
              ref={sectionListRef}
              sections={sections}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              renderSectionHeader={renderSectionHeader}
              getItemLayout={getItemLayout}
              stickySectionHeadersEnabled
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>

        {/* Alphabet Index - only show when not searching */}
        {!search && sections.length > 0 && (
          <View
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 24,
              alignItems: 'center',
            }}
            onLayout={(e) => setAlphabetHeight(e.nativeEvent.layout.height)}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={(e) => {
              const y = e.nativeEvent.locationY;
              const index = Math.floor(y / letterHeight);
              if (index >= 0 && index < ALPHABET.length) {
                handleAlphabetTouch(ALPHABET[index]);
              }
            }}
            onResponderMove={(e) => {
              const y = e.nativeEvent.locationY;
              const index = Math.floor(y / letterHeight);
              if (index >= 0 && index < ALPHABET.length) {
                handleAlphabetTouch(ALPHABET[index]);
              }
            }}
            onResponderRelease={handleAlphabetRelease}
          >
            {ALPHABET.map((letter) => {
              const isAvailable = availableLetters.has(letter);
              const isActive = activeIndexLetter === letter;
              // Scale font size based on available height (min 9, max 12)
              const fontSize = Math.max(9, Math.min(12, letterHeight * 0.75));

              return (
                <View
                  key={letter}
                  style={{
                    height: letterHeight,
                    width: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize,
                      fontWeight: isActive ? '700' : '600',
                      color: isActive
                        ? accentColor
                        : isAvailable
                          ? 'rgba(255, 255, 255, 0.6)'
                          : 'rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {letter}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </BottomSheetModal>
  );
}
