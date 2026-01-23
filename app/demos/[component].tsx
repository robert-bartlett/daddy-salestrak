import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { filterWhitespaceChildren } from '@/components/ui/command/command-utils';
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
import { Message } from '@/components/ui/message';
import {
  Box,
  Center,
  Container,
  Frame,
  HStack,
  Spacer,
  VStack,
} from '@/components/ui/layout';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { Toggle, ToggleIcon } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocalSearchParams } from 'expo-router';
import {
  Bold,
  Calculator,
  Calendar,
  ChevronDown,
  Copy,
  CreditCard,
  FileText,
  Folder,
  Home,
  Italic,
  LogOut,
  Mail,
  MoreHorizontal,
  PlusCircle,
  Settings,
  Smile,
  Trash2,
  User,
} from 'lucide-react-native';
import * as React from 'react';
import { Platform } from 'react-native';

// Map route params to display names
const COMPONENT_NAMES: Record<string, string> = {
  accordion: 'Accordion',
  'alert-dialog': 'Alert Dialog',
  avatar: 'Avatar',
  badge: 'Badge',
  breadcrumb: 'Breadcrumb',
  button: 'Button',
  'button-group': 'Button Group',
  checkbox: 'Checkbox',
  command: 'Command',
  'context-menu': 'Context Menu',
  dialog: 'Dialog',
  'dropdown-menu': 'Dropdown Menu',
  input: 'Input',
  message: 'Message',
  popover: 'Popover',
  'radio-group': 'Radio Group',
  select: 'Select',
  separator: 'Separator',
  spinner: 'Spinner',
  switch: 'Switch',
  tabs: 'Tabs',
  textarea: 'Textarea',
  toggle: 'Toggle',
  tooltip: 'Tooltip',
};

// Demo section wrapper for consistent styling
function DemoSection({ title, children }: { title: string; children: React.ReactNode }) {
  const filteredChildren = filterWhitespaceChildren(children);
  return (
    <VStack gap="sm">
      <Text size="sm" weight="medium" tone="muted">
        {title}
      </Text>
      {filteredChildren}
    </VStack>
  );
}

// Individual component demos
function AccordionDemo() {
  return (
    <Container size="md">
      <DemoSection title="Default Accordion">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <Text>Is it accessible?</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Text tone="muted">
                Yes. It adheres to the WAI-ARIA design pattern.
              </Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <Text>Is it styled?</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Text tone="muted">
                Yes. It comes with default styles that match the design system.
              </Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              <Text>Is it animated?</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Text tone="muted">
                Yes. It's animated by default with smooth expand/collapse transitions.
              </Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DemoSection>
    </Container>
  );
}

function AlertDialogDemo() {
  return (
    <VStack gap="lg">
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
    </VStack>
  );
}

function AvatarDemo() {
  return (
    <VStack gap="lg">
      <DemoSection title="With Image">
        <HStack gap="md" align="center">
          <Avatar alt="User avatar">
            <AvatarImage source={{ uri: 'https://github.com/shadcn.png' }} />
            <AvatarFallback>
              <Text>CN</Text>
            </AvatarFallback>
          </Avatar>
          <Avatar alt="User avatar" size="lg">
            <AvatarImage source={{ uri: 'https://github.com/shadcn.png' }} />
            <AvatarFallback>
              <Text>CN</Text>
            </AvatarFallback>
          </Avatar>
          <Avatar alt="User avatar" size="xl">
            <AvatarImage source={{ uri: 'https://github.com/shadcn.png' }} />
            <AvatarFallback>
              <Text>CN</Text>
            </AvatarFallback>
          </Avatar>
        </HStack>
      </DemoSection>

      <DemoSection title="Fallback Only">
        <HStack gap="md" align="center">
          <Avatar alt="John Doe">
            <AvatarFallback>
              <Text size="xs">JD</Text>
            </AvatarFallback>
          </Avatar>
          <Avatar alt="Alice Brown" size="lg">
            <AvatarFallback>
              <Text size="sm">AB</Text>
            </AvatarFallback>
          </Avatar>
          <Avatar alt="Xavier York" size="xl">
            <AvatarFallback>
              <Text>XY</Text>
            </AvatarFallback>
          </Avatar>
        </HStack>
      </DemoSection>
    </VStack>
  );
}

function BadgeDemo() {
  // State for dismissible demo
  const [dismissibleTags, setDismissibleTags] = React.useState([
    'React',
    'TypeScript',
    'Tailwind',
    'Expo',
  ]);

  const handleDismiss = (tag: string) => {
    setDismissibleTags((prev) => prev.filter((t) => t !== tag));
  };

  const resetTags = () => {
    setDismissibleTags(['React', 'TypeScript', 'Tailwind', 'Expo']);
  };

  return (
    <VStack gap="lg">
      <DemoSection title="Variants">
        <HStack gap="sm" wrap>
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
        </HStack>
      </DemoSection>

      <DemoSection title="Sizes">
        <HStack gap="sm" align="center" wrap>
          <Badge size="sm">
            <Text>Small</Text>
          </Badge>
          <Badge size="default">
            <Text>Default</Text>
          </Badge>
          <Badge size="lg">
            <Text>Large</Text>
          </Badge>
        </HStack>
      </DemoSection>

      <DemoSection title="With Icon Prop">
        <HStack gap="sm" align="center" wrap>
          <Badge icon={PlusCircle} size="sm">
            <Text>New</Text>
          </Badge>
          <Badge icon={Mail} variant="secondary">
            <Text>3 messages</Text>
          </Badge>
          <Badge icon={User} variant="outline" size="lg">
            <Text>Profile</Text>
          </Badge>
        </HStack>
      </DemoSection>

      <DemoSection title="Sizes with Icons">
        <HStack gap="sm" align="center" wrap>
          <Badge icon={PlusCircle} size="sm" variant="secondary">
            <Text>Small</Text>
          </Badge>
          <Badge icon={PlusCircle} size="default" variant="secondary">
            <Text>Default</Text>
          </Badge>
          <Badge icon={PlusCircle} size="lg" variant="secondary">
            <Text>Large</Text>
          </Badge>
        </HStack>
      </DemoSection>

      <DemoSection title="Color Variants">
        <HStack gap="sm" align="center" wrap>
          <Badge size="lg" variant="color" color="grey" icon={PlusCircle}>
            <Text>Grey</Text>
          </Badge>
          <Badge size="lg" variant="color" color="red" icon={PlusCircle}>
            <Text>Red</Text>
          </Badge>
          <Badge size="lg" variant="color" color="orange" icon={PlusCircle}>
            <Text>Orange</Text>
          </Badge>
          <Badge size="lg" variant="color" color="yellow" icon={PlusCircle}>
            <Text>Yellow</Text>
          </Badge>
          <Badge size="lg" variant="color" color="light-green" icon={PlusCircle}>
            <Text>Light Green</Text>
          </Badge>
          <Badge size="lg" variant="color" color="green" icon={PlusCircle}>
            <Text>Green</Text>
          </Badge>
          <Badge size="lg" variant="color" color="teal" icon={PlusCircle}>
            <Text>Teal</Text>
          </Badge>
          <Badge size="lg" variant="color" color="cyan" icon={PlusCircle}>
            <Text>Cyan</Text>
          </Badge>
          <Badge size="lg" variant="color" color="light-blue" icon={PlusCircle}>
            <Text>Light Blue</Text>
          </Badge>
          <Badge size="lg" variant="color" color="blue" icon={PlusCircle}>
            <Text>Blue</Text>
          </Badge>
          <Badge size="lg" variant="color" color="purple" icon={PlusCircle}>
            <Text>Purple</Text>
          </Badge>
          <Badge size="lg" variant="color" color="light-purple" icon={PlusCircle}>
            <Text>Light Purple</Text>
          </Badge>
          <Badge size="lg" variant="color" color="violet" icon={PlusCircle}>
            <Text>Violet</Text>
          </Badge>
          <Badge size="lg" variant="color" color="magenta" icon={PlusCircle}>
            <Text>Magenta</Text>
          </Badge>
          <Badge size="lg" variant="color" color="pink" icon={PlusCircle}>
            <Text>Pink</Text>
          </Badge>
        </HStack>
      </DemoSection>

      <DemoSection title="Dismissible">
        <VStack gap="sm">
          <HStack gap="sm" align="center" wrap>
            {dismissibleTags.map((tag) => (
              <Badge key={tag} onDismiss={() => handleDismiss(tag)}>
                <Text>{tag}</Text>
              </Badge>
            ))}
            {dismissibleTags.length === 0 && (
              <Text tone="muted" size="sm">
                All tags dismissed!
              </Text>
            )}
          </HStack>
          {dismissibleTags.length < 4 && (
            <Button variant="link" size="sm" onPress={resetTags}>
              Reset tags
            </Button>
          )}
        </VStack>
      </DemoSection>

      <DemoSection title="Dismissible Sizes">
        <HStack gap="sm" align="center" wrap>
          <Badge size="sm" onDismiss={() => {}}>
            <Text>Small</Text>
          </Badge>
          <Badge size="default" onDismiss={() => {}}>
            <Text>Default</Text>
          </Badge>
          <Badge size="lg" onDismiss={() => {}}>
            <Text>Large</Text>
          </Badge>
        </HStack>
      </DemoSection>

      <DemoSection title="Dismissible with Icons">
        <HStack gap="sm" align="center" wrap>
          <Badge icon={User} onDismiss={() => {}}>
            <Text>John Doe</Text>
          </Badge>
          <Badge icon={Mail} onDismiss={() => {}}>
            <Text>Inbox</Text>
          </Badge>
          <Badge icon={Settings} size="lg" onDismiss={() => {}}>
            <Text>Settings</Text>
          </Badge>
        </HStack>
      </DemoSection>
    </VStack>
  );
}

function BreadcrumbDemo() {
  return (
    <VStack gap="lg">
      <DemoSection title="Basic">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onPress={() => console.log('Home pressed')}>
                <Text>Home</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onPress={() => console.log('Products pressed')}>
                <Text>Products</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <Text>Current Page</Text>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </DemoSection>

      <DemoSection title="With Icons">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink icon={Home} onPress={() => {}}>
                <Text>Home</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink icon={Folder} onPress={() => {}}>
                <Text>Documents</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage icon={FileText}>
                <Text>Report.pdf</Text>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </DemoSection>

      <DemoSection title="Custom Separator">
        <Breadcrumb separator={<Text tone="muted">/</Text>}>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onPress={() => {}}>
                <Text>Home</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onPress={() => {}}>
                <Text>Library</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <Text>Data</Text>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </DemoSection>

      <DemoSection title="With Ellipsis (Manual)">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onPress={() => {}}>
                <Text>Home</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis onPress={() => {}} />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onPress={() => {}}>
                <Text>Components</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <Text>Breadcrumb</Text>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </DemoSection>

      <DemoSection title="Auto-Collapse (maxItems=4)">
        <Breadcrumb>
          <BreadcrumbList
            maxItems={4}
            ellipsisProps={{ onPress: () => console.log('Ellipsis pressed') }}
          >
            <BreadcrumbItem>
              <BreadcrumbLink onPress={() => {}}>
                <Text>Home</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onPress={() => {}}>
                <Text>Documents</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onPress={() => {}}>
                <Text>Projects</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onPress={() => {}}>
                <Text>2024</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onPress={() => {}}>
                <Text>Q4</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <Text>Report.pdf</Text>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </DemoSection>
    </VStack>
  );
}

function ButtonDemo() {
  return (
    <VStack gap="lg">
      <DemoSection title="Variants">
        <HStack gap="sm" align="center" wrap>
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
        </HStack>
      </DemoSection>

      <DemoSection title="Sizes">
        <HStack gap="sm" align="center" wrap>
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
        </HStack>
      </DemoSection>

      <DemoSection title="With Icon">
        <HStack gap="sm" wrap>
          <Button>
            <Icon as={Mail} />
            <Text>Login with Email</Text>
          </Button>
          <Button variant="outline">
            <Icon as={User} />
            <Text>Profile</Text>
          </Button>
        </HStack>
      </DemoSection>

      <DemoSection title="Disabled">
        <HStack gap="sm" wrap>
          <Button disabled>
            <Text>Disabled</Text>
          </Button>
          <Button variant="outline" disabled>
            <Text>Disabled</Text>
          </Button>
        </HStack>
      </DemoSection>
    </VStack>
  );
}

function ButtonGroupDemo() {
  return (
    <VStack gap="lg">
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
    </VStack>
  );
}

function CheckboxDemo() {
  const [checked1, setChecked1] = React.useState(false);
  const [checked2, setChecked2] = React.useState(true);
  const [checked3, setChecked3] = React.useState(false);

  return (
    <VStack gap="lg">
      <DemoSection title="Default">
        <VStack gap="md">
          <HStack gap="sm" align="center">
            <Checkbox checked={checked1} onCheckedChange={setChecked1} />
            <Text>Accept terms and conditions</Text>
          </HStack>
          <HStack gap="sm" align="center">
            <Checkbox checked={checked2} onCheckedChange={setChecked2} />
            <Text>Receive marketing emails</Text>
          </HStack>
          <HStack gap="sm" align="center">
            <Checkbox checked={checked3} onCheckedChange={setChecked3} disabled />
            <Text tone="muted">Disabled option</Text>
          </HStack>
        </VStack>
      </DemoSection>
    </VStack>
  );
}

function CommandDemo() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState('');

  // Keyboard shortcut to open dialog (Cmd+K)
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setDialogOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    setDialogOpen(false);
  };

  return (
    <VStack gap="md" align="center">
      <Button variant="outline" onPress={() => setDialogOpen(true)}>
        <Text>Open Command Palette</Text>
        <Text tone="muted" size="xs">
          ⌘K
        </Text>
      </Button>
      {selectedValue && (
        <Text tone="muted" size="sm">
          Selected: {selectedValue}
        </Text>
      )}
      <CommandDialog open={dialogOpen} onOpenChange={setDialogOpen} loop>
        <CommandInput placeholder="Type a command or search..." autoFocus />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem value="calendar" onSelect={handleSelect}>
              <Icon as={Calendar} tone="muted" />
              <Text>Calendar</Text>
            </CommandItem>
            <CommandItem value="search-emoji" keywords={['emoji', 'emoticon', 'face']} onSelect={handleSelect}>
              <Icon as={Smile} tone="muted" />
              <Text>Search Emoji</Text>
            </CommandItem>
            <CommandItem value="calculator" onSelect={handleSelect}>
              <Icon as={Calculator} tone="muted" />
              <Text>Calculator</Text>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem value="new-file" onSelect={handleSelect}>
              <Icon as={FileText} tone="muted" />
              <Text>New File</Text>
            </CommandItem>
            <CommandItem value="new-folder" onSelect={handleSelect}>
              <Icon as={Folder} tone="muted" />
              <Text>New Folder</Text>
            </CommandItem>
            <CommandItem value="copy" keywords={['clipboard', 'duplicate']} onSelect={handleSelect}>
              <Icon as={Copy} tone="muted" />
              <Text>Copy</Text>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem value="profile" keywords={['account', 'user']} onSelect={handleSelect}>
              <Icon as={User} tone="muted" />
              <Text>Profile</Text>
            </CommandItem>
            <CommandItem value="billing" keywords={['payment', 'subscription']} onSelect={handleSelect}>
              <Icon as={CreditCard} tone="muted" />
              <Text>Billing</Text>
            </CommandItem>
            <CommandItem value="settings" keywords={['preferences', 'config']} onSelect={handleSelect}>
              <Icon as={Settings} tone="muted" />
              <Text>Settings</Text>
            </CommandItem>
            <CommandItem value="logout" disabled onSelect={handleSelect}>
              <Icon as={LogOut} tone="muted" />
              <Text>Log out</Text>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </VStack>
  );
}

function ContextMenuDemo() {
  const [bookmarked, setBookmarked] = React.useState(true);
  const [person, setPerson] = React.useState('pedro');

  return (
    <VStack gap="lg">
      <DemoSection title="Default">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <Box background="muted" border rounded="md" padding="lg">
              <Center>
                <Text tone="muted" size="sm">
                  Long press or right click here
                </Text>
              </Center>
            </Box>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Actions</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuItem>
              <Icon as={Copy} size={16} tone="muted" />
              <Text>Copy</Text>
            </ContextMenuItem>
            <ContextMenuItem>
              <Icon as={PlusCircle} size={16} tone="muted" />
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
              <Icon as={Trash2} size={16} tone="destructive" />
              <Text>Delete</Text>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </DemoSection>
    </VStack>
  );
}

function DialogDemo() {
  return (
    <VStack gap="lg">
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
            <Box paddingY="md">
              <VStack gap="md">
                <VStack gap="sm">
                  <Text size="sm" weight="medium">
                    Name
                  </Text>
                  <Input placeholder="John Doe" />
                </VStack>
                <VStack gap="sm">
                  <Text size="sm" weight="medium">
                    Username
                  </Text>
                  <Input placeholder="@johndoe" />
                </VStack>
              </VStack>
            </Box>
            <DialogFooter>
              <Button>
                <Text>Save changes</Text>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DemoSection>
    </VStack>
  );
}

function DropdownMenuDemo() {
  const [showStatusBar, setShowStatusBar] = React.useState(true);
  const [position, setPosition] = React.useState('bottom');

  return (
    <VStack gap="lg">
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
              <Icon as={User} size={16} tone="muted" />
              <Text>Profile</Text>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon as={Settings} size={16} tone="muted" />
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
              <Icon as={LogOut} size={16} tone="destructive" />
              <Text>Log out</Text>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DemoSection>
    </VStack>
  );
}

function InputDemo() {
  return (
    <Container size="sm">
      <VStack gap="lg">
      <DemoSection title="Default">
        <Input placeholder="Email" />
      </DemoSection>

      <DemoSection title="With Label">
        <VStack gap="sm">
          <Text size="sm" weight="medium">
            Email
          </Text>
          <Input placeholder="name@example.com" />
        </VStack>
      </DemoSection>

      <DemoSection title="Disabled">
        <Input placeholder="Disabled" editable={false} />
      </DemoSection>
      </VStack>
    </Container>
  );
}

function MessageDemo() {
  const [showInfo, setShowInfo] = React.useState(true);
  const [showDanger, setShowDanger] = React.useState(true);
  const [showSubtle, setShowSubtle] = React.useState(true);

  return (
    <Container size="md">
      <VStack gap="lg">
        <DemoSection title="Variants">
          <VStack gap="sm">
            {showInfo && (
              <Message variant="info" onDismiss={() => setShowInfo(false)}>
                This is an informational message.
              </Message>
            )}
            {showDanger && (
              <Message variant="danger" onDismiss={() => setShowDanger(false)}>
                This is a danger/error message.
              </Message>
            )}
            {showSubtle && (
              <Message variant="subtle" onDismiss={() => setShowSubtle(false)}>
                This is a subtle message.
              </Message>
            )}
            {!showInfo && !showDanger && !showSubtle && (
              <Button variant="outline" onPress={() => {
                setShowInfo(true);
                setShowDanger(true);
                setShowSubtle(true);
              }}>
                <Text>Reset Messages</Text>
              </Button>
            )}
          </VStack>
        </DemoSection>

        <DemoSection title="Position">
          <VStack gap="sm">
            <Message variant="info" dismissable={false}>
              Left-aligned (default)
            </Message>
            <Message variant="info" position="centered" dismissable={false}>
              Centered message
            </Message>
          </VStack>
        </DemoSection>

        <DemoSection title="With Action">
          <Message variant="danger" dismissable={false} action={
            <Button variant="link" size="sm">
              <Text>Learn more</Text>
            </Button>
          }>
            Your session is about to expire.
          </Message>
        </DemoSection>

        <DemoSection title="Non-dismissable">
          <Message variant="subtle" dismissable={false}>
            This message cannot be dismissed.
          </Message>
        </DemoSection>
      </VStack>
    </Container>
  );
}

function PopoverDemo() {
  return (
    <VStack gap="lg">
      <DemoSection title="Default">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Text>Open popover</Text>
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <VStack gap="md">
              <VStack gap="sm">
                <Text weight="medium">Dimensions</Text>
                <Text tone="muted" size="sm">
                  Set the dimensions for the layer.
                </Text>
              </VStack>
              <VStack gap="sm">
                <HStack align="center" justify="between">
                  <Text size="sm">Width</Text>
                  <Input width="sm" placeholder="100%" />
                </HStack>
                <HStack align="center" justify="between">
                  <Text size="sm">Height</Text>
                  <Input width="sm" placeholder="25px" />
                </HStack>
              </VStack>
            </VStack>
          </PopoverContent>
        </Popover>
      </DemoSection>
    </VStack>
  );
}

function RadioGroupDemo() {
  const [value, setValue] = React.useState('comfortable');

  return (
    <VStack gap="lg">
      <DemoSection title="Default">
        <RadioGroup value={value} onValueChange={setValue}>
          <HStack gap="sm" align="center">
            <RadioGroupItem value="default" />
            <Text>Default</Text>
          </HStack>
          <HStack gap="sm" align="center">
            <RadioGroupItem value="comfortable" />
            <Text>Comfortable</Text>
          </HStack>
          <HStack gap="sm" align="center">
            <RadioGroupItem value="compact" />
            <Text>Compact</Text>
          </HStack>
        </RadioGroup>
      </DemoSection>

      <DemoSection title="With Disabled">
        <RadioGroup value="option-one" onValueChange={() => {}}>
          <HStack gap="sm" align="center">
            <RadioGroupItem value="option-one" />
            <Text>Option One</Text>
          </HStack>
          <HStack gap="sm" align="center">
            <RadioGroupItem value="option-two" disabled />
            <Text tone="muted">Option Two (disabled)</Text>
          </HStack>
        </RadioGroup>
      </DemoSection>
    </VStack>
  );
}

function SelectDemo() {
  const [fruit, setFruit] = React.useState<string | undefined>();

  return (
    <Container size="sm">
      <VStack gap="lg">
      <DemoSection title="Default">
        <Select value={fruit ? { value: fruit, label: fruit } : undefined} onValueChange={(opt) => setFruit(opt?.value)}>
          <SelectTrigger fullWidth>
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
      </VStack>
    </Container>
  );
}

function SeparatorDemo() {
  return (
    <Container size="md">
      <VStack gap="lg">
      <DemoSection title="Horizontal">
        <VStack gap="md">
          <VStack gap="sm">
            <Text weight="medium">Radix Primitives</Text>
            <Text tone="muted" size="sm">
              An open-source UI component library.
            </Text>
          </VStack>
          <Separator />
          <HStack gap="md" align="center">
            <Text size="sm">Blog</Text>
            <Separator orientation="vertical" length="md" />
            <Text size="sm">Docs</Text>
            <Separator orientation="vertical" length="md" />
            <Text size="sm">Source</Text>
          </HStack>
        </VStack>
      </DemoSection>
      </VStack>
    </Container>
  );
}

function SwitchDemo() {
  const [enabled1, setEnabled1] = React.useState(false);
  const [enabled2, setEnabled2] = React.useState(true);

  return (
    <Container size="sm">
      <VStack gap="lg">
      <DemoSection title="Default">
        <VStack gap="md">
          <HStack align="center" justify="between" gap="lg">
            <Text>Airplane Mode</Text>
            <Switch checked={enabled1} onCheckedChange={setEnabled1} />
          </HStack>
          <HStack align="center" justify="between" gap="lg">
            <Text>Notifications</Text>
            <Switch checked={enabled2} onCheckedChange={setEnabled2} />
          </HStack>
          <HStack align="center" justify="between" gap="lg">
            <Text tone="muted">Disabled</Text>
            <Switch checked={false} onCheckedChange={() => {}} disabled />
          </HStack>
        </VStack>
      </DemoSection>
      </VStack>
    </Container>
  );
}

function TabsDemo() {
  const [activeTab, setActiveTab] = React.useState('account');

  return (
    <Container size="md">
      <VStack gap="lg">
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
            <Box background="card" border rounded="md" padding="md">
              <VStack gap="md">
                <Text weight="medium">Account</Text>
                <Text tone="muted" size="sm">
                Make changes to your account here. Click save when you're done.
                </Text>
                <VStack gap="sm">
                  <Text size="sm" weight="medium">
                    Name
                  </Text>
                  <Input placeholder="Name" defaultValue="Pedro Duarte" />
                </VStack>
              </VStack>
            </Box>
          </TabsContent>
          <TabsContent value="password">
            <Box background="card" border rounded="md" padding="md">
              <VStack gap="md">
                <Text weight="medium">Password</Text>
                <Text tone="muted" size="sm">
                Change your password here. After saving, you'll be logged out.
                </Text>
                <VStack gap="sm">
                  <Text size="sm" weight="medium">
                    Current password
                  </Text>
                  <Input placeholder="Current password" secureTextEntry />
                </VStack>
              </VStack>
            </Box>
          </TabsContent>
        </Tabs>
      </DemoSection>
      </VStack>
    </Container>
  );
}

function TextareaDemo() {
  return (
    <Container size="sm">
      <VStack gap="lg">
      <DemoSection title="Default">
        <Textarea placeholder="Type your message here." />
      </DemoSection>

      <DemoSection title="With Label">
        <VStack gap="sm">
          <Text size="sm" weight="medium">
            Your message
          </Text>
          <Textarea placeholder="Tell us what you think..." />
        </VStack>
      </DemoSection>

      <DemoSection title="Disabled">
        <Textarea placeholder="Disabled" editable={false} />
      </DemoSection>
      </VStack>
    </Container>
  );
}

function ToggleDemo() {
  const [defaultBold, setDefaultBold] = React.useState(false);
  const [defaultItalic, setDefaultItalic] = React.useState(false);
  const [outlineBold, setOutlineBold] = React.useState(false);
  const [outlineItalic, setOutlineItalic] = React.useState(false);
  const [withTextBold, setWithTextBold] = React.useState(false);

  return (
    <VStack gap="lg">
      <DemoSection title="Default">
        <HStack gap="sm">
          <Toggle pressed={defaultBold} onPressedChange={setDefaultBold}>
            <ToggleIcon as={Bold} />
          </Toggle>
          <Toggle pressed={defaultItalic} onPressedChange={setDefaultItalic}>
            <ToggleIcon as={Italic} />
          </Toggle>
        </HStack>
      </DemoSection>

      <DemoSection title="Outline Variant">
        <HStack gap="sm">
          <Toggle variant="outline" pressed={outlineBold} onPressedChange={setOutlineBold}>
            <ToggleIcon as={Bold} />
          </Toggle>
          <Toggle variant="outline" pressed={outlineItalic} onPressedChange={setOutlineItalic}>
            <ToggleIcon as={Italic} />
          </Toggle>
        </HStack>
      </DemoSection>

      <DemoSection title="With Text">
        <HStack gap="sm">
          <Toggle pressed={withTextBold} onPressedChange={setWithTextBold}>
            <ToggleIcon as={Bold} />
            <Text>Bold</Text>
          </Toggle>
        </HStack>
      </DemoSection>

      <DemoSection title="Disabled">
        <Toggle pressed={false} onPressedChange={() => {}} disabled>
          <ToggleIcon as={Bold} />
        </Toggle>
      </DemoSection>
    </VStack>
  );
}

function TooltipDemo() {
  return (
    <VStack gap="lg">
      <DemoSection title="Default">
        <HStack gap="md">
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
        </HStack>
      </DemoSection>
    </VStack>
  );
}

function SpinnerDemo() {
  return (
    <VStack gap="lg">
      <DemoSection title="Default">
        <Spinner />
      </DemoSection>

      <DemoSection title="Sizes">
        <HStack gap="md" align="center">
          <VStack gap="xs" align="center">
            <Spinner size={12} />
            <Text tone="muted" size="xs">
              12px
            </Text>
          </VStack>
          <VStack gap="xs" align="center">
            <Spinner size={16} />
            <Text tone="muted" size="xs">
              16px
            </Text>
          </VStack>
          <VStack gap="xs" align="center">
            <Spinner size={20} />
            <Text tone="muted" size="xs">
              20px
            </Text>
          </VStack>
          <VStack gap="xs" align="center">
            <Spinner size={24} />
            <Text tone="muted" size="xs">
              24px
            </Text>
          </VStack>
          <VStack gap="xs" align="center">
            <Spinner size={32} />
            <Text tone="muted" size="xs">
              32px
            </Text>
          </VStack>
        </HStack>
      </DemoSection>

      <DemoSection title="Colors">
        <HStack gap="md" align="center" wrap>
          <VStack gap="xs" align="center">
            <Spinner color="#3b82f6" />
            <Text tone="muted" size="xs">
              Blue
            </Text>
          </VStack>
          <VStack gap="xs" align="center">
            <Spinner tone="destructive" />
            <Text tone="muted" size="xs">
              Red
            </Text>
          </VStack>
          <VStack gap="xs" align="center">
            <Spinner color="#10b981" />
            <Text tone="muted" size="xs">
              Green
            </Text>
          </VStack>
          <VStack gap="xs" align="center">
            <Spinner color="#f59e0b" />
            <Text tone="muted" size="xs">
              Amber
            </Text>
          </VStack>
          <VStack gap="xs" align="center">
            <Spinner color="#8b5cf6" />
            <Text tone="muted" size="xs">
              Purple
            </Text>
          </VStack>
          <VStack gap="xs" align="center">
            <Spinner tone="muted" />
            <Text tone="muted" size="xs">
              Muted
            </Text>
          </VStack>
        </HStack>
      </DemoSection>

      <DemoSection title="In Context">
        <HStack gap="sm" wrap>
          <Button disabled>
            <Spinner size={14} tone="primary-foreground" />
            <Text>Loading...</Text>
          </Button>
          <Button variant="outline" disabled>
            <Spinner size={14} />
            <Text>Please wait</Text>
          </Button>
          <Button variant="secondary" disabled>
            <Spinner size={14} />
            <Text>Submitting</Text>
          </Button>
        </HStack>
      </DemoSection>
    </VStack>
  );
}

// Map component names to their demo components
const COMPONENT_DEMOS: Record<string, React.ComponentType> = {
  accordion: AccordionDemo,
  'alert-dialog': AlertDialogDemo,
  avatar: AvatarDemo,
  badge: BadgeDemo,
  breadcrumb: BreadcrumbDemo,
  button: ButtonDemo,
  'button-group': ButtonGroupDemo,
  checkbox: CheckboxDemo,
  command: CommandDemo,
  'context-menu': ContextMenuDemo,
  dialog: DialogDemo,
  'dropdown-menu': DropdownMenuDemo,
  input: InputDemo,
  message: MessageDemo,
  popover: PopoverDemo,
  'radio-group': RadioGroupDemo,
  select: SelectDemo,
  separator: SeparatorDemo,
  spinner: SpinnerDemo,
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
    <Frame fill>
      <ScrollArea fill showScrollbar={Platform.OS === 'web' ? 'auto' : 'never'}>
        <Box padding="md">
          <VStack gap="xl" align="center">
            <Text size="2xl" weight="semibold">
              {displayName}
            </Text>
            {DemoComponent ? (
              <DemoComponent />
            ) : (
              <Text tone="muted">Demo not available yet.</Text>
            )}
            <Spacer size="xl" />
          </VStack>
        </Box>
      </ScrollArea>
    </Frame>
  );
}
