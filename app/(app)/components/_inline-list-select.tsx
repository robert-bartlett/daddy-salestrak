import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, Pressable, ScrollView, TextInput, Modal, useColorScheme } from 'react-native';
import { Check, Search, X } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getIOSColors, getIOSSheetColors } from '@/lib/ios-colors';

type ListSelectItem = {
  id: string;
  label: string;
  sublabel?: string;
  color?: string;
};

export type ListSelectConfig = {
  title: string;
  items: ListSelectItem[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  allowMultiple?: boolean;
  selectedIds?: string[];
  onSelectMultiple?: (ids: string[]) => void;
  searchable?: boolean;
};

type InlineListSelectProps = {
  open: boolean;
  onClose: () => void;
} & ListSelectConfig;

export function InlineListSelect({
  open,
  onClose,
  title,
  items,
  selectedId = null,
  onSelect,
  allowMultiple = false,
  selectedIds: initialSelectedIds = [],
  onSelectMultiple,
  searchable = false,
}: InlineListSelectProps) {
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const iosColors = getIOSColors(colorScheme);
  const prevOpenRef = useRef(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);

  // Internal state for multi-select
  const [multiSelectedIds, setMultiSelectedIds] = useState<Set<string>>(
    new Set(initialSelectedIds)
  );

  // Reset internal state when sheet opens
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setMultiSelectedIds(new Set(initialSelectedIds));
      setSearchQuery('');
    }
    prevOpenRef.current = open;
  }, [open, initialSelectedIds]);

  const handleSelect = useCallback((id: string) => {
    if (allowMultiple) {
      setMultiSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    } else {
      onSelect?.(id);
      onClose();
    }
  }, [allowMultiple, onSelect, onClose]);

  // Sync multi-select changes back to parent
  useEffect(() => {
    if (allowMultiple && onSelectMultiple) {
      onSelectMultiple(Array.from(multiSelectedIds));
    }
  }, [multiSelectedIds, allowMultiple, onSelectMultiple]);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        (item.sublabel && item.sublabel.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  // Get selected items for chips display
  const selectedItems = useMemo(() => {
    if (!allowMultiple) return [];
    return items.filter((item) => multiSelectedIds.has(item.id));
  }, [items, multiSelectedIds, allowMultiple]);

  // Group filtered items alphabetically (for searchable/contact-style lists)
  const groupedItems = useMemo(() => {
    if (!searchable) return null;
    const groups: { letter: string; items: ListSelectItem[] }[] = [];
    const sorted = [...filteredItems].sort((a, b) =>
      a.label.localeCompare(b.label)
    );
    for (const item of sorted) {
      const letter = item.label.charAt(0).toUpperCase();
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.letter === letter) {
        lastGroup.items.push(item);
      } else {
        groups.push({ letter, items: [item] });
      }
    }
    return groups;
  }, [filteredItems, searchable]);

  return (
    <Modal
      visible={open}
      presentationStyle="formSheet"
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header with grabber */}
        <View
          style={{
            paddingBottom: 12,
            borderBottomWidth: searchable ? 0 : 0.5,
            borderBottomColor: colors.separator,
          }}
        >
          {/* Grabber handle */}
          <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 8 }}>
            <View
              style={{
                width: 36,
                height: 5,
                borderRadius: 2.5,
                backgroundColor: colors.grabber,
              }}
            />
          </View>

          {/* Title */}
          <View style={{ paddingHorizontal: 20 }}>
            <Text size="lg" weight="semibold" style={{ color: colors.title }}>
              {title}
            </Text>
          </View>
        </View>

        {/* Search bar */}
        {searchable ? (
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderBottomWidth: 0.5,
              borderBottomColor: colors.separator,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: iosColors.tertiarySystemFill,
                borderRadius: 10,
                paddingHorizontal: 8,
                height: 36,
                gap: 6,
              }}
            >
              <Icon as={Search} size={16} color={iosColors.secondaryLabel} />
              <TextInput
                ref={searchInputRef}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search"
                placeholderTextColor={iosColors.secondaryLabel}
                style={{
                  flex: 1,
                  fontSize: 17,
                  color: colors.title,
                  paddingVertical: 0,
                }}
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 ? (
                <Pressable
                  onPress={() => setSearchQuery('')}
                  hitSlop={8}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      backgroundColor: iosColors.secondaryLabel,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon as={X} size={10} color={colors.background} />
                  </View>
                </Pressable>
              ) : null}
            </View>

            {/* Selected user chips - fixed height to prevent layout jump */}
            {allowMultiple ? (
              <View style={{ height: 44, justifyContent: 'center' }}>
                {selectedItems.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      gap: 8,
                      alignItems: 'center',
                    }}
                  >
                    {selectedItems.map((item) => (
                      <Pressable
                        key={item.id}
                        onPress={() => handleSelect(item.id)}
                      >
                        {({ pressed }) => (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                              backgroundColor: iosColors.tertiarySystemFill,
                              borderRadius: 16,
                              paddingLeft: 4,
                              paddingRight: 10,
                              paddingVertical: 4,
                              opacity: pressed ? 0.7 : 1,
                            }}
                          >
                            <Avatar size="sm" alt={item.label}>
                              <AvatarFallback>
                                <Text size="xs" style={{ color: colors.title }}>
                                  {item.sublabel && item.sublabel.length <= 3
                                    ? item.sublabel
                                    : item.label.charAt(0)}
                                </Text>
                              </AvatarFallback>
                            </Avatar>
                            <Text size="sm" style={{ color: colors.title }}>
                              {item.label.split(' ')[0]}
                            </Text>
                            <Icon as={X} size={12} color={iosColors.secondaryLabel} />
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : (
                  <Text size="sm" style={{ color: iosColors.tertiaryLabel }}>
                    Tap to select
                  </Text>
                )}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Scrollable list */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Grouped alphabetical list (contacts style) */}
          {groupedItems ? (
            <>
              {groupedItems.map((group) => (
                <View key={group.letter}>
                  {/* Section letter header */}
                  <View
                    style={{
                      paddingHorizontal: 20,
                      paddingTop: 16,
                      paddingBottom: 4,
                    }}
                  >
                    <Text
                      size="sm"
                      weight="semibold"
                      style={{ color: iosColors.secondaryLabel }}
                    >
                      {group.letter}
                    </Text>
                  </View>

                  {/* Separator below letter header */}
                  <View
                    style={{
                      height: 0.5,
                      backgroundColor: colors.separator,
                      marginHorizontal: 20,
                    }}
                  />

                  {/* Items in section */}
                  {group.items.map((item, itemIndex) => {
                    const isSelected = allowMultiple
                      ? multiSelectedIds.has(item.id)
                      : selectedId === item.id;

                    return (
                      <View key={item.id}>
                        {/* Inset separator between items (not before first) */}
                        {itemIndex > 0 ? (
                          <View
                            style={{
                              height: 0.5,
                              backgroundColor: colors.separator,
                              marginLeft: 56,
                            }}
                          />
                        ) : null}
                        <Pressable
                          onPress={() => handleSelect(item.id)}
                        >
                          {({ pressed }) => (
                            <View
                              style={{
                                opacity: pressed ? 0.7 : 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingVertical: 10,
                              }}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                                {item.sublabel && item.sublabel.length <= 3 && !item.sublabel.includes('@') ? (
                                  <Avatar size="sm" alt={item.label}>
                                    <AvatarFallback>
                                      <Text size="xs" style={{ color: colors.title }}>{item.sublabel}</Text>
                                    </AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <Avatar size="sm" alt={item.label}>
                                    <AvatarFallback>
                                      <Text size="xs" style={{ color: colors.title }}>{item.label.charAt(0)}</Text>
                                    </AvatarFallback>
                                  </Avatar>
                                )}

                                <View style={{ flex: 1, gap: 2 }}>
                                  <Text
                                    weight={isSelected ? 'semibold' : 'regular'}
                                    style={{ color: colors.title }}
                                  >
                                    {item.label}
                                  </Text>
                                  {item.sublabel && (item.sublabel.length > 3 || item.sublabel.includes('@')) ? (
                                    <Text size="sm" style={{ color: colors.subtitle }}>
                                      {item.sublabel}
                                    </Text>
                                  ) : null}
                                </View>
                              </View>

                              {isSelected ? (
                                <Icon as={Check} size={20} color="#0A84FF" />
                              ) : null}
                            </View>
                          )}
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              ))}

              {/* No results */}
              {groupedItems.length === 0 && searchQuery.trim().length > 0 ? (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <Text size="sm" style={{ color: colors.subtitle }}>
                    No results for "{searchQuery}"
                  </Text>
                </View>
              ) : null}
            </>
          ) : (
            /* Flat list (non-searchable) */
            filteredItems.map((item) => {
              const isSelected = allowMultiple
                ? multiSelectedIds.has(item.id)
                : selectedId === item.id;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelect(item.id)}
                >
                  {({ pressed }) => (
                    <View
                      style={{
                        opacity: pressed ? 0.7 : 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 20,
                        paddingVertical: 14,
                        borderBottomWidth: 0.5,
                        borderBottomColor: colors.separator,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                        {item.color ? (
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 6,
                              backgroundColor: item.color,
                            }}
                          />
                        ) : null}

                        {item.sublabel && item.sublabel.length <= 3 && !item.sublabel.includes('@') ? (
                          <Avatar size="sm" alt={item.label}>
                            <AvatarFallback>
                              <Text size="xs" style={{ color: colors.title }}>{item.sublabel}</Text>
                            </AvatarFallback>
                          </Avatar>
                        ) : null}

                        <View style={{ flex: 1, gap: 4 }}>
                          <Text
                            weight={isSelected ? 'semibold' : 'regular'}
                            style={{ color: colors.title }}
                          >
                            {item.label}
                          </Text>
                          {item.sublabel && (item.sublabel.length > 3 || item.sublabel.includes('@')) ? (
                            <Text size="sm" style={{ color: colors.subtitle }}>
                              {item.sublabel}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      {isSelected ? (
                        <Icon as={Check} size={20} color="#0A84FF" />
                      ) : null}
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
