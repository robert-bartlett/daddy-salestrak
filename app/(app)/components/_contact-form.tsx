import { useState, useRef, useCallback } from 'react';
import { View, Pressable, TextInput, useColorScheme } from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  Building2,
  Tag,
} from 'lucide-react-native';

import { NativeSheetScrollBody, NativeSheetHeader } from '@/components/ui/bottom-sheet';
import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { CONTACT_TYPES, type ContactType } from '@/lib/mock-data';
import { useContacts } from '@/lib/contacts-context';
import { useMapSheet } from '@/lib/map-sheet-context';
import { useSheetContext } from '@/lib/sheet-context';
import { getIOSSheetColors } from '@/lib/ios-colors';

type ContactFormProps = {
  onBack: () => void;
  onCancel: () => void;
};

export function ContactForm({ onBack, onCancel }: ContactFormProps) {
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const { addContact } = useContacts();
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [type, setType] = useState<ContactType>('lead');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');

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
    openListSelectSheet({
      title: 'Contact Type',
      items: CONTACT_TYPES.map((ct) => ({ id: ct.value, label: ct.label })),
      selectedId: type,
      onSelect: (id) => setType(id as ContactType),
    });
  }, [openListSelectSheet, type]);

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

  return (
    <>
      <NativeSheetHeader>
        <HStack gap="sm" align="center">
          <Button variant="ghost" size="icon" onPress={onBack}>
            <Icon as={ChevronLeft} size={20} />
          </Button>
          <VStack gap="xs">
            <Text size="lg" weight="semibold">
              New Contact
            </Text>
            <Text size="sm" tone="muted">
              Add a person to your network
            </Text>
          </VStack>
        </HStack>
      </NativeSheetHeader>

      <NativeSheetScrollBody contentContainerStyle={{ paddingBottom: 120 }}>
        <VStack gap="sm">
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
                <VStack gap="xs">
                  <HStack gap="xs" align="center">
                    <Text size="xs" style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      First Name
                    </Text>
                    <Text size="xs" style={{ color: COLORS.accent }}>*</Text>
                  </HStack>
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
                  ) : (
                    <Text
                      size="base"
                      weight="semibold"
                      style={{ color: firstName ? COLORS.text : COLORS.textMuted }}
                      numberOfLines={1}
                    >
                      {firstName || 'Tap to enter...'}
                    </Text>
                  )}
                </VStack>
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
                <VStack gap="xs">
                  <HStack gap="xs" align="center">
                    <Text size="xs" style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Last Name
                    </Text>
                    <Text size="xs" style={{ color: COLORS.accent }}>*</Text>
                  </HStack>
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
                  ) : (
                    <Text
                      size="base"
                      weight="semibold"
                      style={{ color: lastName ? COLORS.text : COLORS.textMuted }}
                      numberOfLines={1}
                    >
                      {lastName || 'Tap to enter...'}
                    </Text>
                  )}
                </VStack>
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
                <VStack gap="xs">
                  <Text size="xs" style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Type
                  </Text>
                  <Text
                    size="base"
                    weight="semibold"
                    style={{ color: COLORS.text }}
                  >
                    {selectedTypeLabel}
                  </Text>
                </VStack>
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
                <VStack gap="xs">
                  <Text size="xs" style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Company
                  </Text>
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
                    <Text
                      size="base"
                      weight="semibold"
                      style={{ color: companyName ? COLORS.text : COLORS.textMuted }}
                    >
                      {companyName || 'Tap to enter...'}
                    </Text>
                  )}
                </VStack>
              </View>
            </HStack>
          </Pressable>

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
