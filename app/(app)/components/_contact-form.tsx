import { useState, useRef, useCallback } from 'react';
import { View, Pressable, TextInput, useColorScheme, Keyboard } from 'react-native';
import { BlurView } from 'expo-blur';
import {
  ChevronRight,
  User,
  Phone,
  Mail,
  Building2,
  Tag,
  X,
  Check,
} from 'lucide-react-native';

import { NativeSheetScrollBody } from '@/components/ui/bottom-sheet';
import { VStack, HStack, FloatingActionPill, ACTION_PILL_FOOTER_HEIGHT } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { CONTACT_TYPES, type ContactType } from '@/lib/mock-data';
import { useContacts } from '@/lib/contacts-context';
import { useMapSheet } from '@/lib/map-sheet-context';
import { InlineListSelect, type ListSelectConfig } from './_inline-list-select';
import { getIOSSheetColors } from '@/lib/ios-colors';

type ContactFormProps = {
  onBack: () => void;
};

export function ContactForm({ onBack }: ContactFormProps) {
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const { addContact } = useContacts();
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [type, setType] = useState<ContactType>('lead');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Inline list select state
  const [listSelect, setListSelect] = useState<ListSelectConfig | null>(null);

  // Editing states
  const [firstNameEditing, setFirstNameEditing] = useState(false);
  const [lastNameEditing, setLastNameEditing] = useState(false);
  const [phoneEditing, setPhoneEditing] = useState(false);
  const [emailEditing, setEmailEditing] = useState(false);
  const [companyEditing, setCompanyEditing] = useState(false);

  // Input refs
  const firstNameInputRef = useRef<TextInput>(null);
  const lastNameInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const companyInputRef = useRef<TextInput>(null);

  const handleOpenTypeSheet = useCallback(() => {
    setListSelect({
      title: 'Contact Type',
      items: CONTACT_TYPES.map((ct) => ({ id: ct.value, label: ct.label })),
      selectedId: type,
      onSelect: (id) => setType(id as ContactType),
    });
  }, [type]);

  const handleCreate = () => {
    if (!firstName.trim() || !lastName.trim()) return;

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    addContact({
      name: fullName,
      type,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      companyName: companyName.trim() || undefined,
    });

    // Reset form and close
    setFirstName('');
    setLastName('');
    setType('lead');
    setPhone('');
    setEmail('');
    setCompanyName('');
    closeSheet();
  };

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0;
  const selectedTypeLabel = CONTACT_TYPES.find((t) => t.value === type)?.label ?? 'Lead';

  // Dismiss keyboard and clear editing states
  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
    setFirstNameEditing(false);
    setLastNameEditing(false);
    setPhoneEditing(false);
    setEmailEditing(false);
    setCompanyEditing(false);
  }, []);

  return (
    <BlurView
      intensity={100}
      tint="dark"
      style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)' }}
    >
      {/* Scrollable content */}
      <NativeSheetScrollBody
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: ACTION_PILL_FOOTER_HEIGHT,
        }}
        onScrollBeginDrag={dismissKeyboard}
      >
        <VStack gap="sm">
          {/* Header */}
          <Text size="xl" weight="semibold" style={{ color: COLORS.text, marginBottom: 8 }}>
            New Contact
          </Text>

          {/* First Name + Last Name Row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* First Name Widget */}
            <Pressable
              onPress={() => {
                setFirstNameEditing(true);
                setTimeout(() => firstNameInputRef.current?.focus(), 50);
              }}
              style={{
                flex: 1,
                backgroundColor: COLORS.cardBg,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <VStack gap="sm">
                <Icon as={User} size={20} color={COLORS.accent} />
                {firstNameEditing ? (
                      <Input
                        ref={firstNameInputRef}
                        placeholder="John"
                        value={firstName}
                        onChangeText={setFirstName}
                        onBlur={() => setFirstNameEditing(false)}
                        onSubmitEditing={() => {
                          setFirstNameEditing(false);
                          setLastNameEditing(true);
                          setTimeout(() => lastNameInputRef.current?.focus(), 50);
                        }}
                        returnKeyType="next"
                        autoCapitalize="words"
                        autoFocus
                      />
                ) : firstName ? (
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }} numberOfLines={1}>{firstName}</Text>
                ) : (
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }}>First Name <Text style={{ color: COLORS.accent }}>*</Text></Text>
                )}
              </VStack>
            </Pressable>

            {/* Last Name Widget */}
            <Pressable
              onPress={() => {
                setLastNameEditing(true);
                setTimeout(() => lastNameInputRef.current?.focus(), 50);
              }}
              style={{
                flex: 1,
                backgroundColor: COLORS.cardBg,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <VStack gap="sm">
                <View style={{ height: 20 }} />
                {lastNameEditing ? (
                      <Input
                        ref={lastNameInputRef}
                        placeholder="Smith"
                        value={lastName}
                        onChangeText={setLastName}
                        onBlur={() => setLastNameEditing(false)}
                        onSubmitEditing={() => setLastNameEditing(false)}
                        returnKeyType="done"
                        autoCapitalize="words"
                        autoFocus
                      />
                ) : lastName ? (
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }} numberOfLines={1}>{lastName}</Text>
                ) : (
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }}>Last Name <Text style={{ color: COLORS.accent }}>*</Text></Text>
                )}
              </VStack>
            </Pressable>
          </View>

          {/* Type Widget - Full Width */}
          <Pressable
            onPress={handleOpenTypeSheet}
            style={{
              backgroundColor: COLORS.cardBg,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <HStack justify="between" align="center">
              <HStack gap="md" align="center">
                <Icon as={Tag} size={20} color={COLORS.textSecondary} />
                <Text size="base" weight="semibold" style={{ color: COLORS.text }} numberOfLines={1}>{selectedTypeLabel}</Text>
              </HStack>
              <Icon as={ChevronRight} size={16} color={COLORS.textMuted} />
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
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }} numberOfLines={1}>{phone || 'Phone'}</Text>
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
                        placeholder="email@example.com"
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
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }} numberOfLines={1}>{email || 'Email'}</Text>
                )}
              </VStack>
            </Pressable>
          </View>

          {/* Company Name Widget */}
          <Pressable
            onPress={() => {
              setCompanyEditing(true);
              setTimeout(() => companyInputRef.current?.focus(), 50);
            }}
            style={{
              backgroundColor: COLORS.cardBg,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <HStack gap="md" align="center">
              <Icon as={Building2} size={20} color={COLORS.textSecondary} />
              <View style={{ flex: 1 }}>
                {companyEditing ? (
                      <Input
                        ref={companyInputRef}
                        placeholder="Optional company or organization"
                        value={companyName}
                        onChangeText={setCompanyName}
                        onBlur={() => setCompanyEditing(false)}
                        onSubmitEditing={() => setCompanyEditing(false)}
                        returnKeyType="done"
                        autoFocus
                      />
                ) : (
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }} numberOfLines={1}>{companyName || 'Company'}</Text>
                )}
              </View>
            </HStack>
          </Pressable>

        </VStack>
      </NativeSheetScrollBody>

      {/* Floating action pill */}
      <FloatingActionPill
        actions={[
          { icon: X, onPress: onBack, accessibilityLabel: 'Cancel' },
          { icon: Check, onPress: handleCreate, disabled: !isValid, accessibilityLabel: 'Create' },
        ]}
      />

      {/* Inline list select overlay */}
      <InlineListSelect
        open={!!listSelect}
        onClose={() => setListSelect(null)}
        title={listSelect?.title ?? ''}
        items={listSelect?.items ?? []}
        selectedId={listSelect?.selectedId}
        onSelect={listSelect?.onSelect}
      />
    </BlurView>
  );
}
