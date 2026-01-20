import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from '@/components/ui/button-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { Toggle, ToggleIcon } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocalSearchParams } from 'expo-router';
import {
  Bold,
  ChevronDown,
  Copy,
  Italic,
  LogOut,
  Mail,
  MoreHorizontal,
  PlusCircle,
  Settings,
  Trash2,
  User,
} from 'lucide-react-native';
import * as React from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';

// Map route params to display names
const COMPONENT_NAMES: Record<string, string> = {
  accordion: 'Accordion',
  'alert-dialog': 'Alert Dialog',
  avatar: 'Avatar',
  badge: 'Badge',
  button: 'Button',
  'button-group': 'Button Group',
  checkbox: 'Checkbox',
  'context-menu': 'Context Menu',
  dialog: 'Dialog',
  'dropdown-menu': 'Dropdown Menu',
  input: 'Input',
  popover: 'Popover',
  'radio-group': 'Radio Group',
  select: 'Select',
  separator: 'Separator',
  switch: 'Switch',
  tabs: 'Tabs',
  textarea: 'Textarea',
  toggle: 'Toggle',
  tooltip: 'Tooltip',
};

// Demo section wrapper for consistent styling
function DemoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-muted-foreground text-sm font-medium">{title}</Text>
      {children}
    </View>
  );
}

// Individual component demos
function AccordionDemo() {
  return (
    <View className="w-full max-w-md gap-6">
      <DemoSection title="Default Accordion">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <Text>Is it accessible?</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Text className="text-muted-foreground">
                Yes. It adheres to the WAI-ARIA design pattern.
              </Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <Text>Is it styled?</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Text className="text-muted-foreground">
                Yes. It comes with default styles that match the design system.
              </Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              <Text>Is it animated?</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Text className="text-muted-foreground">
                Yes. It's animated by default with smooth expand/collapse transitions.
              </Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DemoSection>
    </View>
  );
}

function AlertDialogDemo() {
  return (
    <View className="gap-6">
      <DemoSection title="Destructive Action">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Text>Delete Account</Text>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove
                your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Text>Cancel</Text>
              </AlertDialogCancel>
              <AlertDialogAction>
                <Text>Continue</Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DemoSection>
    </View>
  );
}

function AvatarDemo() {
  return (
    <View className="gap-6">
      <DemoSection title="With Image">
        <View className="flex-row items-center gap-4">
          <Avatar alt="User avatar">
            <AvatarImage source={{ uri: 'https://github.com/shadcn.png' }} />
            <AvatarFallback>
              <Text>CN</Text>
            </AvatarFallback>
          </Avatar>
          <Avatar alt="User avatar" className="size-12">
            <AvatarImage source={{ uri: 'https://github.com/shadcn.png' }} />
            <AvatarFallback>
              <Text>CN</Text>
            </AvatarFallback>
          </Avatar>
          <Avatar alt="User avatar" className="size-16">
            <AvatarImage source={{ uri: 'https://github.com/shadcn.png' }} />
            <AvatarFallback>
              <Text>CN</Text>
            </AvatarFallback>
          </Avatar>
        </View>
      </DemoSection>

      <DemoSection title="Fallback Only">
        <View className="flex-row items-center gap-4">
          <Avatar alt="John Doe">
            <AvatarFallback>
              <Text className="text-xs">JD</Text>
            </AvatarFallback>
          </Avatar>
          <Avatar alt="Alice Brown" className="size-12">
            <AvatarFallback>
              <Text className="text-sm">AB</Text>
            </AvatarFallback>
          </Avatar>
          <Avatar alt="Xavier York" className="size-16">
            <AvatarFallback>
              <Text>XY</Text>
            </AvatarFallback>
          </Avatar>
        </View>
      </DemoSection>
    </View>
  );
}

function BadgeDemo() {
  return (
    <View className="gap-6">
      <DemoSection title="Variants">
        <View className="flex-row flex-wrap gap-2">
          <Badge>
            <Text>Default</Text>
          </Badge>
          <Badge variant="secondary">
            <Text>Secondary</Text>
          </Badge>
          <Badge variant="destructive">
            <Text>Destructive</Text>
          </Badge>
          <Badge variant="outline">
            <Text>Outline</Text>
          </Badge>
        </View>
      </DemoSection>

      <DemoSection title="With Icon">
        <View className="flex-row flex-wrap gap-2">
          <Badge>
            <Icon as={PlusCircle} size={12} className="text-primary-foreground" />
            <Text>New</Text>
          </Badge>
          <Badge variant="secondary">
            <Icon as={Mail} size={12} className="text-secondary-foreground" />
            <Text>3 messages</Text>
          </Badge>
        </View>
      </DemoSection>
    </View>
  );
}

function ButtonDemo() {
  return (
    <View className="gap-6">
      <DemoSection title="Variants">
        <View className="flex-row flex-wrap items-center gap-2">
          <Button>
            <Text>Default</Text>
          </Button>
          <Button variant="secondary">
            <Text>Secondary</Text>
          </Button>
          <Button variant="destructive">
            <Text>Destructive</Text>
          </Button>
          <Button variant="outline">
            <Text>Outline</Text>
          </Button>
          <Button variant="ghost">
            <Text>Ghost</Text>
          </Button>
          <Button variant="link">
            <Text>Link</Text>
          </Button>
        </View>
      </DemoSection>

      <DemoSection title="Sizes">
        <View className="flex-row flex-wrap items-center gap-2">
          <Button size="sm">
            <Text>Small</Text>
          </Button>
          <Button size="default">
            <Text>Default</Text>
          </Button>
          <Button size="lg">
            <Text>Large</Text>
          </Button>
          <Button size="icon">
            <Icon as={Settings} />
          </Button>
        </View>
      </DemoSection>

      <DemoSection title="With Icon">
        <View className="flex-row flex-wrap gap-2">
          <Button>
            <Icon as={Mail} />
            <Text>Login with Email</Text>
          </Button>
          <Button variant="outline">
            <Icon as={User} />
            <Text>Profile</Text>
          </Button>
        </View>
      </DemoSection>

      <DemoSection title="Disabled">
        <View className="flex-row flex-wrap gap-2">
          <Button disabled>
            <Text>Disabled</Text>
          </Button>
          <Button variant="outline" disabled>
            <Text>Disabled</Text>
          </Button>
        </View>
      </DemoSection>
    </View>
  );
}

function ButtonGroupDemo() {
  return (
    <View className="gap-6">
      <DemoSection title="Horizontal Group">
        <ButtonGroup>
          <Button variant="outline">Left</Button>
          <Button variant="outline">Middle</Button>
          <Button variant="outline">Right</Button>
        </ButtonGroup>
      </DemoSection>

      <DemoSection title="With Separator">
        <ButtonGroup>
          <Button variant="outline">Save</Button>
          <ButtonGroupSeparator />
          <Button variant="outline" size="icon">
            <Icon as={ChevronDown} />
          </Button>
        </ButtonGroup>
      </DemoSection>

      <DemoSection title="With Text Prefix">
        <ButtonGroup>
          <ButtonGroupText>$</ButtonGroupText>
          <Button variant="outline">100</Button>
        </ButtonGroup>
      </DemoSection>

      <DemoSection title="Vertical Group">
        <ButtonGroup orientation="vertical">
          <Button variant="outline">Top</Button>
          <Button variant="outline">Middle</Button>
          <Button variant="outline">Bottom</Button>
        </ButtonGroup>
      </DemoSection>

      <DemoSection title="Mixed Variants">
        <ButtonGroup>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Delete</Button>
        </ButtonGroup>
      </DemoSection>
    </View>
  );
}

function CheckboxDemo() {
  const [checked1, setChecked1] = React.useState(false);
  const [checked2, setChecked2] = React.useState(true);
  const [checked3, setChecked3] = React.useState(false);

  return (
    <View className="gap-6">
      <DemoSection title="Default">
        <View className="gap-4">
          <View className="flex-row items-center gap-3">
            <Checkbox checked={checked1} onCheckedChange={setChecked1} />
            <Text>Accept terms and conditions</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Checkbox checked={checked2} onCheckedChange={setChecked2} />
            <Text>Receive marketing emails</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Checkbox checked={checked3} onCheckedChange={setChecked3} disabled />
            <Text className="opacity-50">Disabled option</Text>
          </View>
        </View>
      </DemoSection>
    </View>
  );
}

function ContextMenuDemo() {
  const [bookmarked, setBookmarked] = React.useState(true);
  const [person, setPerson] = React.useState('pedro');

  return (
    <View className="gap-6">
      <DemoSection title="Default">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <Pressable className="border-border bg-muted/30 flex items-center justify-center rounded-md border border-dashed px-6 py-4">
              <Text className="text-muted-foreground text-sm">Long press or right click here</Text>
            </Pressable>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Actions</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuItem>
              <Icon as={Copy} size={16} className="text-muted-foreground" />
              <Text>Copy</Text>
            </ContextMenuItem>
            <ContextMenuItem>
              <Icon as={PlusCircle} size={16} className="text-muted-foreground" />
              <Text>Add to favorites</Text>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem checked={bookmarked} onCheckedChange={setBookmarked}>
              <Text>Bookmarked</Text>
            </ContextMenuCheckboxItem>
            <ContextMenuSeparator />
            <ContextMenuLabel>Assign to</ContextMenuLabel>
            <ContextMenuRadioGroup value={person} onValueChange={setPerson}>
              <ContextMenuRadioItem value="pedro">
                <Text>Pedro</Text>
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="colm">
                <Text>Colm</Text>
              </ContextMenuRadioItem>
            </ContextMenuRadioGroup>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">
              <Icon as={Trash2} size={16} className="text-destructive" />
              <Text>Delete</Text>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </DemoSection>
    </View>
  );
}

function DialogDemo() {
  return (
    <View className="gap-6">
      <DemoSection title="Default Dialog">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Text>Edit Profile</Text>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <View className="gap-4 py-4">
              <View className="gap-2">
                <Text className="text-sm font-medium">Name</Text>
                <Input placeholder="John Doe" />
              </View>
              <View className="gap-2">
                <Text className="text-sm font-medium">Username</Text>
                <Input placeholder="@johndoe" />
              </View>
            </View>
            <DialogFooter>
              <Button>
                <Text>Save changes</Text>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DemoSection>
    </View>
  );
}

function DropdownMenuDemo() {
  const [showStatusBar, setShowStatusBar] = React.useState(true);
  const [position, setPosition] = React.useState('bottom');

  return (
    <View className="gap-6">
      <DemoSection title="Default">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Text>Open Menu</Text>
              <Icon as={ChevronDown} size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Icon as={User} size={16} className="text-muted-foreground" />
              <Text>Profile</Text>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon as={Settings} size={16} className="text-muted-foreground" />
              <Text>Settings</Text>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
              <Text>Show Status Bar</Text>
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Position</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
              <DropdownMenuRadioItem value="top">
                <Text>Top</Text>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="bottom">
                <Text>Bottom</Text>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Icon as={LogOut} size={16} className="text-destructive" />
              <Text>Log out</Text>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DemoSection>
    </View>
  );
}

function InputDemo() {
  return (
    <View className="w-full max-w-sm gap-6">
      <DemoSection title="Default">
        <Input placeholder="Email" />
      </DemoSection>

      <DemoSection title="With Label">
        <View className="gap-2">
          <Text className="text-sm font-medium">Email</Text>
          <Input placeholder="name@example.com" />
        </View>
      </DemoSection>

      <DemoSection title="Disabled">
        <Input placeholder="Disabled" editable={false} />
      </DemoSection>
    </View>
  );
}

function PopoverDemo() {
  return (
    <View className="gap-6">
      <DemoSection title="Default">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Text>Open popover</Text>
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <View className="gap-4">
              <View className="gap-2">
                <Text className="font-medium">Dimensions</Text>
                <Text className="text-muted-foreground text-sm">
                  Set the dimensions for the layer.
                </Text>
              </View>
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm">Width</Text>
                  <Input className="w-24" placeholder="100%" />
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm">Height</Text>
                  <Input className="w-24" placeholder="25px" />
                </View>
              </View>
            </View>
          </PopoverContent>
        </Popover>
      </DemoSection>
    </View>
  );
}

function RadioGroupDemo() {
  const [value, setValue] = React.useState('comfortable');

  return (
    <View className="gap-6">
      <DemoSection title="Default">
        <RadioGroup value={value} onValueChange={setValue}>
          <View className="flex-row items-center gap-3">
            <RadioGroupItem value="default" />
            <Text>Default</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <RadioGroupItem value="comfortable" />
            <Text>Comfortable</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <RadioGroupItem value="compact" />
            <Text>Compact</Text>
          </View>
        </RadioGroup>
      </DemoSection>

      <DemoSection title="With Disabled">
        <RadioGroup value="option-one" onValueChange={() => {}}>
          <View className="flex-row items-center gap-3">
            <RadioGroupItem value="option-one" />
            <Text>Option One</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <RadioGroupItem value="option-two" disabled />
            <Text className="opacity-50">Option Two (disabled)</Text>
          </View>
        </RadioGroup>
      </DemoSection>
    </View>
  );
}

function SelectDemo() {
  const [fruit, setFruit] = React.useState<string | undefined>();

  return (
    <View className="w-full max-w-sm gap-6">
      <DemoSection title="Default">
        <Select value={fruit ? { value: fruit, label: fruit } : undefined} onValueChange={(opt) => setFruit(opt?.value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple" label="Apple">
              Apple
            </SelectItem>
            <SelectItem value="banana" label="Banana">
              Banana
            </SelectItem>
            <SelectItem value="blueberry" label="Blueberry">
              Blueberry
            </SelectItem>
            <SelectItem value="grapes" label="Grapes">
              Grapes
            </SelectItem>
            <SelectItem value="pineapple" label="Pineapple">
              Pineapple
            </SelectItem>
          </SelectContent>
        </Select>
      </DemoSection>
    </View>
  );
}

function SeparatorDemo() {
  return (
    <View className="w-full max-w-md gap-6">
      <DemoSection title="Horizontal">
        <View className="gap-4">
          <View>
            <Text className="font-medium">Radix Primitives</Text>
            <Text className="text-muted-foreground text-sm">
              An open-source UI component library.
            </Text>
          </View>
          <Separator />
          <View className="flex-row items-center gap-4">
            <Text className="text-sm">Blog</Text>
            <Separator orientation="vertical" className="h-4" />
            <Text className="text-sm">Docs</Text>
            <Separator orientation="vertical" className="h-4" />
            <Text className="text-sm">Source</Text>
          </View>
        </View>
      </DemoSection>
    </View>
  );
}

function SwitchDemo() {
  const [enabled1, setEnabled1] = React.useState(false);
  const [enabled2, setEnabled2] = React.useState(true);

  return (
    <View className="w-full max-w-sm gap-6">
      <DemoSection title="Default">
        <View className="gap-4">
          <View className="flex-row items-center justify-between gap-8">
            <Text>Airplane Mode</Text>
            <Switch checked={enabled1} onCheckedChange={setEnabled1} />
          </View>
          <View className="flex-row items-center justify-between gap-8">
            <Text>Notifications</Text>
            <Switch checked={enabled2} onCheckedChange={setEnabled2} />
          </View>
          <View className="flex-row items-center justify-between gap-8">
            <Text className="opacity-50">Disabled</Text>
            <Switch checked={false} onCheckedChange={() => {}} disabled />
          </View>
        </View>
      </DemoSection>
    </View>
  );
}

function TabsDemo() {
  const [activeTab, setActiveTab] = React.useState('account');

  return (
    <View className="w-full max-w-md gap-6">
      <DemoSection title="Default">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="account">
              <Text>Account</Text>
            </TabsTrigger>
            <TabsTrigger value="password">
              <Text>Password</Text>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <View className="bg-card border-border gap-4 rounded-md border p-4">
              <Text className="font-medium">Account</Text>
              <Text className="text-muted-foreground text-sm">
                Make changes to your account here. Click save when you're done.
              </Text>
              <View className="gap-2">
                <Text className="text-sm font-medium">Name</Text>
                <Input placeholder="Name" defaultValue="Pedro Duarte" />
              </View>
            </View>
          </TabsContent>
          <TabsContent value="password">
            <View className="bg-card border-border gap-4 rounded-md border p-4">
              <Text className="font-medium">Password</Text>
              <Text className="text-muted-foreground text-sm">
                Change your password here. After saving, you'll be logged out.
              </Text>
              <View className="gap-2">
                <Text className="text-sm font-medium">Current password</Text>
                <Input placeholder="Current password" secureTextEntry />
              </View>
            </View>
          </TabsContent>
        </Tabs>
      </DemoSection>
    </View>
  );
}

function TextareaDemo() {
  return (
    <View className="w-full max-w-sm gap-6">
      <DemoSection title="Default">
        <Textarea placeholder="Type your message here." />
      </DemoSection>

      <DemoSection title="With Label">
        <View className="gap-2">
          <Text className="text-sm font-medium">Your message</Text>
          <Textarea placeholder="Tell us what you think..." />
        </View>
      </DemoSection>

      <DemoSection title="Disabled">
        <Textarea placeholder="Disabled" editable={false} />
      </DemoSection>
    </View>
  );
}

function ToggleDemo() {
  const [defaultBold, setDefaultBold] = React.useState(false);
  const [defaultItalic, setDefaultItalic] = React.useState(false);
  const [outlineBold, setOutlineBold] = React.useState(false);
  const [outlineItalic, setOutlineItalic] = React.useState(false);
  const [withTextBold, setWithTextBold] = React.useState(false);

  return (
    <View className="gap-6">
      <DemoSection title="Default">
        <View className="flex-row gap-2">
          <Toggle pressed={defaultBold} onPressedChange={setDefaultBold}>
            <ToggleIcon as={Bold} />
          </Toggle>
          <Toggle pressed={defaultItalic} onPressedChange={setDefaultItalic}>
            <ToggleIcon as={Italic} />
          </Toggle>
        </View>
      </DemoSection>

      <DemoSection title="Outline Variant">
        <View className="flex-row gap-2">
          <Toggle variant="outline" pressed={outlineBold} onPressedChange={setOutlineBold}>
            <ToggleIcon as={Bold} />
          </Toggle>
          <Toggle variant="outline" pressed={outlineItalic} onPressedChange={setOutlineItalic}>
            <ToggleIcon as={Italic} />
          </Toggle>
        </View>
      </DemoSection>

      <DemoSection title="With Text">
        <View className="flex-row gap-2">
          <Toggle pressed={withTextBold} onPressedChange={setWithTextBold}>
            <ToggleIcon as={Bold} />
            <Text>Bold</Text>
          </Toggle>
        </View>
      </DemoSection>

      <DemoSection title="Disabled">
        <Toggle pressed={false} onPressedChange={() => {}} disabled>
          <ToggleIcon as={Bold} />
        </Toggle>
      </DemoSection>
    </View>
  );
}

function TooltipDemo() {
  return (
    <View className="gap-6">
      <DemoSection title="Default">
        <View className="flex-row gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <Icon as={PlusCircle} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <Text>Add to library</Text>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <Icon as={Settings} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <Text>Settings</Text>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <Icon as={MoreHorizontal} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <Text>More options</Text>
            </TooltipContent>
          </Tooltip>
        </View>
      </DemoSection>
    </View>
  );
}

// Map component names to their demo components
const COMPONENT_DEMOS: Record<string, React.ComponentType> = {
  accordion: AccordionDemo,
  'alert-dialog': AlertDialogDemo,
  avatar: AvatarDemo,
  badge: BadgeDemo,
  button: ButtonDemo,
  'button-group': ButtonGroupDemo,
  checkbox: CheckboxDemo,
  'context-menu': ContextMenuDemo,
  dialog: DialogDemo,
  'dropdown-menu': DropdownMenuDemo,
  input: InputDemo,
  popover: PopoverDemo,
  'radio-group': RadioGroupDemo,
  select: SelectDemo,
  separator: SeparatorDemo,
  switch: SwitchDemo,
  tabs: TabsDemo,
  textarea: TextareaDemo,
  toggle: ToggleDemo,
  tooltip: TooltipDemo,
};

export default function ComponentDemo() {
  const { component } = useLocalSearchParams<{ component: string }>();
  const displayName = COMPONENT_NAMES[component ?? ''] ?? component;
  const DemoComponent = COMPONENT_DEMOS[component ?? ''];

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="p-4 pb-8"
      showsVerticalScrollIndicator={Platform.OS === 'web'}>
      <View className="items-center gap-8">
        <Text className="text-2xl font-semibold">{displayName}</Text>
        {DemoComponent ? (
          <DemoComponent />
        ) : (
          <Text className="text-muted-foreground">Demo not available yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}
