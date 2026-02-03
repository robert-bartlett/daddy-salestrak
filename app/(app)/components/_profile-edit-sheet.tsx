import { useState, useCallback } from 'react';
import { View, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';

import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  BottomSheetModal,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetScrollBody,
  BottomSheetFooter,
} from '@/components/ui/bottom-sheet';
import { useUser } from '@/lib/user-context';

type ProfileEditSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProfileEditSheet({ open, onOpenChange }: ProfileEditSheetProps) {
  const { profile, updateProfile, updateAvatar } = useUser();

  // Local state for editing
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [avatarUri, setAvatarUri] = useState(profile.avatar);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when sheet opens
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        setName(profile.name);
        setEmail(profile.email);
        setPhone(profile.phone ?? '');
        setAvatarUri(profile.avatar);
      }
      onOpenChange(isOpen);
    },
    [profile, onOpenChange]
  );

  const handlePickImage = useCallback(async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant access to your photo library to change your avatar.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.warn('Failed to pick image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  }, []);

  const handleTakePhoto = useCallback(async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera access to take a photo.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.warn('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  }, []);

  const handleChangePhoto = useCallback(() => {
    Alert.alert('Change Photo', 'Choose a photo source', [
      { text: 'Camera', onPress: handleTakePhoto },
      { text: 'Photo Library', onPress: handlePickImage },
      ...(avatarUri ? [{ text: 'Remove Photo', style: 'destructive' as const, onPress: () => setAvatarUri(undefined) }] : []),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  }, [handlePickImage, handleTakePhoto, avatarUri]);

  const handleSave = useCallback(() => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!trimmedEmail) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    // Basic email validation
    if (!trimmedEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsSaving(true);

    // Update profile
    updateProfile({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone || undefined,
    });

    // Update avatar if changed
    if (avatarUri !== profile.avatar) {
      updateAvatar(avatarUri);
    }

    setIsSaving(false);
    onOpenChange(false);
  }, [name, email, phone, avatarUri, profile.avatar, updateProfile, updateAvatar, onOpenChange]);

  // Generate initials from name
  const initials = (() => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  })();

  return (
    <BottomSheetModal open={open} onOpenChange={handleOpenChange} snapPoints={['80%']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <BottomSheetHeader>
          <BottomSheetTitle>Edit Profile</BottomSheetTitle>
        </BottomSheetHeader>

        <BottomSheetScrollBody>
          <VStack gap="xl">
            {/* Avatar Section */}
            <VStack gap="md" align="center">
              <Avatar size="xl" alt={name}>
                {avatarUri ? (
                  <AvatarImage source={{ uri: avatarUri }} />
                ) : (
                  <AvatarFallback>
                    <Text size="2xl" weight="semibold">
                      {initials}
                    </Text>
                  </AvatarFallback>
                )}
              </Avatar>
              <Button variant="outline" size="sm" onPress={handleChangePhoto}>
                <HStack gap="sm" align="center">
                  <Icon as={Camera} size={16} />
                  <Text size="sm">Change Photo</Text>
                </HStack>
              </Button>
            </VStack>

            {/* Form Fields */}
            <VStack gap="lg">
              <VStack gap="sm">
                <Text size="sm" weight="medium" tone="muted">
                  Name
                </Text>
                <Input
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </VStack>

              <VStack gap="sm">
                <Text size="sm" weight="medium" tone="muted">
                  Email
                </Text>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </VStack>

              <VStack gap="sm">
                <Text size="sm" weight="medium" tone="muted">
                  Phone (optional)
                </Text>
                <Input
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="(555) 123-4567"
                  keyboardType="phone-pad"
                />
              </VStack>
            </VStack>
          </VStack>
        </BottomSheetScrollBody>

        <BottomSheetFooter>
          <HStack gap="md">
            <Button
              variant="outline"
              style={{ flex: 1 }}
              onPress={() => onOpenChange(false)}
            >
              <Text>Cancel</Text>
            </Button>
            <Button
              variant="default"
              style={{ flex: 1 }}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text>{isSaving ? 'Saving...' : 'Save'}</Text>
            </Button>
          </HStack>
        </BottomSheetFooter>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
}
