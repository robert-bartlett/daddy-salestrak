import { useState, useRef, useCallback } from 'react';
import { View, Pressable, TextInput, useColorScheme, Keyboard, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView } from 'expo-glass-effect';
import {
  ChevronRight,
  Building2,
  MapPin,
  Phone,
  Mail,
  Tag,
} from 'lucide-react-native';

import { NativeSheetScrollBody } from '@/components/ui/bottom-sheet';
import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { ACCOUNT_TYPES, type AccountType } from '@/lib/mock-data';
import { useAccounts } from '@/lib/accounts-context';
import { useMapSheet } from '@/lib/map-sheet-context';
import { getIOSSheetColors } from '@/lib/ios-colors';
import { InlineListSelect, type ListSelectConfig } from './_inline-list-select';

type AccountFormProps = {
  onBack: () => void;
};

export function AccountForm({ onBack }: AccountFormProps) {
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { addAccount } = useAccounts();
  const { closeSheet } = useMapSheet();

  // Colors for the form
  const COLORS = {
    text: colors.title,
    textMuted: colors.subtitle,
    textSecondary: colors.subtitle,
    cardBg: colors.rowBackground,
    border: colors.separator,
    accent: '#0A84FF',
  };

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('residential');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Inline list select state
  const [listSelect, setListSelect] = useState<ListSelectConfig | null>(null);

  // Editing states
  const [nameEditing, setNameEditing] = useState(false);
  const [addressEditing, setAddressEditing] = useState(false);
  const [phoneEditing, setPhoneEditing] = useState(false);
  const [emailEditing, setEmailEditing] = useState(false);

  // Input refs
  const nameInputRef = useRef<TextInput>(null);
  const addressInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);

  const handleOpenTypeSheet = useCallback(() => {
    setListSelect({
      title: 'Account Type',
      items: ACCOUNT_TYPES.map((at) => ({ id: at.value, label: at.label })),
      selectedId: type,
      onSelect: (id) => setType(id as AccountType),
    });
  }, [type]);

  const handleCreate = () => {
    if (!name.trim()) return;

    addAccount({
      name: name.trim(),
      type,
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
    });

    // Reset form and close
    setName('');
    setType('residential');
    setAddress('');
    setPhone('');
    setEmail('');
    closeSheet();
  };

  const isValid = name.trim().length > 0;
  const selectedTypeLabel = ACCOUNT_TYPES.find((t) => t.value === type)?.label ?? 'Residential';

  // Dismiss keyboard and clear editing states
  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
    setNameEditing(false);
    setAddressEditing(false);
    setPhoneEditing(false);
    setEmailEditing(false);
  }, []);

  // Footer height for scroll padding (includes 20px bottom offset)
  const footerHeight = 20 + 12 + 56 + Math.max(insets.bottom, 8) + 8;

  return (
    <View style={{ height: windowHeight, maxHeight: '100%' }}>
      {/* Scrollable content */}
      <NativeSheetScrollBody
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: footerHeight + 16,
        }}
        onScrollBeginDrag={dismissKeyboard}
      >
        <VStack gap="sm">
          {/* Header */}
          <Text size="xl" weight="semibold" style={{ color: COLORS.text, marginBottom: 8 }}>
            New Account
          </Text>

          {/* Name + Type Row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Name Widget */}
            <Pressable
              onPress={() => {
                setNameEditing(true);
                setTimeout(() => nameInputRef.current?.focus(), 50);
              }}
              style={{
                flex: 1.5,
                backgroundColor: COLORS.cardBg,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <VStack gap="sm">
                <HStack justify="between" align="center">
                  <Icon as={Building2} size={20} color={COLORS.accent} />
                </HStack>
                {nameEditing ? (
                  <Input
                    ref={nameInputRef}
                    placeholder="e.g., Acme Property Management"
                    value={name}
                    onChangeText={setName}
                    onBlur={() => setNameEditing(false)}
                    onSubmitEditing={() => setNameEditing(false)}
                    returnKeyType="done"
                    autoFocus
                  />
                ) : name ? (
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }} numberOfLines={1}>
                    {name}
                  </Text>
                ) : (
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }}>
                    Name <Text style={{ color: COLORS.accent }}>*</Text>
                  </Text>
                )}
              </VStack>
            </Pressable>

            {/* Type Widget */}
            <Pressable
              onPress={handleOpenTypeSheet}
              style={{
                flex: 1,
                backgroundColor: COLORS.cardBg,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <VStack gap="sm">
                <HStack justify="between" align="center">
                  <Icon as={Tag} size={20} color={COLORS.textSecondary} />
                  <Icon as={ChevronRight} size={16} color={COLORS.textMuted} />
                </HStack>
                <Text
                  size="base"
                  weight="semibold"
                  style={{ color: COLORS.text }}
                  numberOfLines={1}
                >
                  {selectedTypeLabel}
                </Text>
              </VStack>
            </Pressable>
          </View>

          {/* Address Widget */}
          <Pressable
            onPress={() => {
              setAddressEditing(true);
              setTimeout(() => addressInputRef.current?.focus(), 50);
            }}
            style={{
              backgroundColor: COLORS.cardBg,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <HStack gap="md" align="center">
              <Icon as={MapPin} size={20} color={COLORS.textSecondary} />
              <View style={{ flex: 1 }}>
                {addressEditing ? (
                  <Input
                    ref={addressInputRef}
                    placeholder="123 Main St, City, State 12345"
                    value={address}
                    onChangeText={setAddress}
                    onBlur={() => setAddressEditing(false)}
                    onSubmitEditing={() => setAddressEditing(false)}
                    returnKeyType="done"
                    autoFocus
                  />
                ) : (
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }} numberOfLines={1}>
                    {address || 'Address'}
                  </Text>
                )}
              </View>
            </HStack>
          </Pressable>

          {/* Phone + Email Row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Phone Widget */}
            <Pressable
              onPress={() => {
                setPhoneEditing(true);
                setTimeout(() => phoneInputRef.current?.focus(), 50);
              }}
              style={{
                flex: 1,
                backgroundColor: COLORS.cardBg,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <VStack gap="sm">
                <Icon as={Phone} size={20} color={COLORS.textSecondary} />
                {phoneEditing ? (
                  <Input
                    ref={phoneInputRef}
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChangeText={setPhone}
                    onBlur={() => setPhoneEditing(false)}
                    onSubmitEditing={() => setPhoneEditing(false)}
                    returnKeyType="done"
                    keyboardType="phone-pad"
                    autoFocus
                  />
                ) : (
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }} numberOfLines={1}>
                    {phone || 'Phone'}
                  </Text>
                )}
              </VStack>
            </Pressable>

            {/* Email Widget */}
            <Pressable
              onPress={() => {
                setEmailEditing(true);
                setTimeout(() => emailInputRef.current?.focus(), 50);
              }}
              style={{
                flex: 1,
                backgroundColor: COLORS.cardBg,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <VStack gap="sm">
                <Icon as={Mail} size={20} color={COLORS.textSecondary} />
                {emailEditing ? (
                  <Input
                    ref={emailInputRef}
                    placeholder="contact@company.com"
                    value={email}
                    onChangeText={setEmail}
                    onBlur={() => setEmailEditing(false)}
                    onSubmitEditing={() => setEmailEditing(false)}
                    returnKeyType="done"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoFocus
                  />
                ) : (
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }} numberOfLines={1}>
                    {email || 'Email'}
                  </Text>
                )}
              </VStack>
            </Pressable>
          </View>

        </VStack>
      </NativeSheetScrollBody>

      {/* Footer - absolute positioned at bottom */}
      <View
        style={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 8) + 8,
          backgroundColor: colors.background,
          zIndex: 100,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 56,
            gap: 12,
          }}
        >
          {/* Cancel Button - Glass effect */}
          <Pressable onPress={onBack} style={{ flex: 1 }}>
            {({ pressed }) => (
              <GlassView
                glassEffectStyle="regular"
                style={{
                  height: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 25,
                  borderCurve: 'continuous',
                  opacity: pressed ? 0.7 : 1,
                }}
              >
                <Text
                  weight="medium"
                  style={{
                    color: '#FFFFFF',
                    fontSize: 17,
                  }}
                >
                  Cancel
                </Text>
              </GlassView>
            )}
          </Pressable>

          {/* Create Button - Prominent glass pill */}
          <Pressable
            onPress={handleCreate}
            disabled={!isValid}
            style={{ flex: 1.2 }}
          >
            {({ pressed }) => (
              <GlassView
                glassEffectStyle="regular"
                tintColor="rgba(120, 120, 128, 0.6)"
                style={{
                  height: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 25,
                  borderCurve: 'continuous',
                  opacity: !isValid ? 0.4 : pressed ? 0.8 : 1,
                }}
              >
                <Text
                  weight="semibold"
                  style={{
                    color: '#FFFFFF',
                    fontSize: 17,
                  }}
                >
                  Create
                </Text>
              </GlassView>
            )}
          </Pressable>
        </View>
      </View>

      {/* Inline list select overlay */}
      <InlineListSelect
        open={!!listSelect}
        onClose={() => setListSelect(null)}
        title={listSelect?.title ?? ''}
        items={listSelect?.items ?? []}
        selectedId={listSelect?.selectedId}
        onSelect={listSelect?.onSelect}
      />
    </View>
  );
}
