import { useState, useRef, useCallback } from 'react';
import { View, Pressable, TextInput, useColorScheme } from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  Phone,
  Mail,
  Tag,
} from 'lucide-react-native';

import { NativeSheetScrollBody, NativeSheetHeader } from '@/components/ui/bottom-sheet';
import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ACCOUNT_TYPES, type AccountType } from '@/lib/mock-data';
import { useAccounts } from '@/lib/accounts-context';
import { useMapSheet } from '@/lib/map-sheet-context';
import { useSheetContext } from '@/lib/sheet-context';
import { getIOSSheetColors } from '@/lib/ios-colors';

type AccountFormProps = {
  onBack: () => void;
  onCancel: () => void;
};

export function AccountForm({ onBack, onCancel }: AccountFormProps) {
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const { addAccount } = useAccounts();
  const { closeSheet } = useMapSheet();
  const { openListSelectSheet } = useSheetContext();

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
    openListSelectSheet({
      title: 'Account Type',
      items: ACCOUNT_TYPES.map((at) => ({ id: at.value, label: at.label })),
      selectedId: type,
      onSelect: (id) => setType(id as AccountType),
    });
  }, [openListSelectSheet, type]);

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

  return (
    <>
      <NativeSheetHeader>
        <HStack gap="sm" align="center">
          <Button variant="ghost" size="icon" onPress={onBack}>
            <Icon as={ChevronLeft} size={20} />
          </Button>
          <VStack gap="xs">
            <Text size="lg" weight="semibold">
              New Account
            </Text>
            <Text size="sm" tone="muted">
              Create a company or organization
            </Text>
          </VStack>
        </HStack>
      </NativeSheetHeader>

      <NativeSheetScrollBody contentContainerStyle={{ paddingBottom: 120 }}>
        <VStack gap="sm">
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
                <VStack gap="xs">
                  <HStack gap="xs" align="center">
                    <Text size="xs" style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Name
                    </Text>
                    <Text size="xs" style={{ color: COLORS.accent }}>*</Text>
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
                  ) : (
                    <Text
                      size="base"
                      weight="semibold"
                      style={{ color: name ? COLORS.text : COLORS.textMuted }}
                      numberOfLines={1}
                    >
                      {name || 'Tap to enter...'}
                    </Text>
                  )}
                </VStack>
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
                <VStack gap="xs">
                  <Text size="xs" style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Type
                  </Text>
                  <Text
                    size="base"
                    weight="semibold"
                    style={{ color: COLORS.text }}
                    numberOfLines={1}
                  >
                    {selectedTypeLabel}
                  </Text>
                </VStack>
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
                <VStack gap="xs">
                  <Text size="xs" style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Address
                  </Text>
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
                    <Text
                      size="base"
                      weight="semibold"
                      style={{ color: address ? COLORS.text : COLORS.textMuted }}
                    >
                      {address || 'Tap to enter...'}
                    </Text>
                  )}
                </VStack>
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
                <VStack gap="xs">
                  <Text size="xs" style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Phone
                  </Text>
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
                    <Text
                      size="base"
                      weight="semibold"
                      style={{ color: phone ? COLORS.text : COLORS.textMuted }}
                      numberOfLines={1}
                    >
                      {phone || 'Tap to enter...'}
                    </Text>
                  )}
                </VStack>
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
                <VStack gap="xs">
                  <Text size="xs" style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Email
                  </Text>
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
                    <Text
                      size="base"
                      weight="semibold"
                      style={{ color: email ? COLORS.text : COLORS.textMuted }}
                      numberOfLines={1}
                    >
                      {email || 'Tap to enter...'}
                    </Text>
                  )}
                </VStack>
              </VStack>
            </Pressable>
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Button variant="ghost" onPress={onCancel}>
                Cancel
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button onPress={handleCreate} disabled={!isValid}>
                Create
              </Button>
            </View>
          </View>
        </VStack>
      </NativeSheetScrollBody>
    </>
  );
}
