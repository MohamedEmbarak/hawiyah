import type {ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes} from 'vue';
import {Button as ButtonBase, Checkbox as CheckboxBase, Radio as RadioBase, Switch as SwitchBase, TextField as TextFieldBase, Textarea as TextareaBase, Select as SelectBase, FileUpload as FileUploadBase} from './forms.js';
import {IconButton as IconButtonBase} from './content.js';
import {PasswordField as PasswordFieldBase, SearchField as SearchFieldBase, NumberField as NumberFieldBase, Slider as SliderBase, PinInput as PinInputBase, TagInput as TagInputBase, MultiSelect as MultiSelectBase, FileDropzone as FileDropzoneBase} from './controls.js';
import {Combobox as ComboboxBase} from './interactive.js';
import {DatePicker as DatePickerBase} from './calendar.js';
import {NavigationDrawer as NavigationDrawerBase} from './navigation-drawer.js';

// Vue forwards $attrs at runtime. Describe those native attributes to template
// checkers without turning them into runtime props or consuming DOM listeners.
export type WithNativeAttributes<Component extends new (...args: never[]) => {$props: object}, Attributes> =
  Pick<Component, keyof Component> &
  (new (...args: ConstructorParameters<Component>) => InstanceType<Component> & {
    $props: InstanceType<Component>['$props'] & Omit<Attributes, keyof InstanceType<Component>['$props']>;
  });

type FixedInput = Omit<InputHTMLAttributes, 'type' | 'value'>;
type CheckedInput = Omit<FixedInput, 'checked'>;
type FileInput = Omit<FixedInput, 'files'>;
type NamedControl = Pick<InputHTMLAttributes, 'name'>;

export const Button = ButtonBase as WithNativeAttributes<typeof ButtonBase, ButtonHTMLAttributes>;
export const Checkbox = CheckboxBase as WithNativeAttributes<typeof CheckboxBase, CheckedInput>;
export const Radio = RadioBase as WithNativeAttributes<typeof RadioBase, CheckedInput>;
export const Switch = SwitchBase as WithNativeAttributes<typeof SwitchBase, CheckedInput>;
export const TextField = TextFieldBase as WithNativeAttributes<typeof TextFieldBase, InputHTMLAttributes>;
export const Textarea = TextareaBase as WithNativeAttributes<typeof TextareaBase, TextareaHTMLAttributes>;
export const Select = SelectBase as WithNativeAttributes<typeof SelectBase, SelectHTMLAttributes>;
export const FileUpload = FileUploadBase as WithNativeAttributes<typeof FileUploadBase, FileInput>;

export const IconButton = IconButtonBase as WithNativeAttributes<typeof IconButtonBase, Omit<ButtonHTMLAttributes, 'aria-label'>>;

export const PasswordField = PasswordFieldBase as WithNativeAttributes<typeof PasswordFieldBase, FixedInput>;
export const SearchField = SearchFieldBase as WithNativeAttributes<typeof SearchFieldBase, FixedInput>;
export const NumberField = NumberFieldBase as WithNativeAttributes<typeof NumberFieldBase, FixedInput>;
export const Slider = SliderBase as WithNativeAttributes<typeof SliderBase, FixedInput>;
export const PinInput = PinInputBase as WithNativeAttributes<typeof PinInputBase, NamedControl>;
export const TagInput = TagInputBase as WithNativeAttributes<typeof TagInputBase, NamedControl>;
export const MultiSelect = MultiSelectBase as WithNativeAttributes<typeof MultiSelectBase, NamedControl>;
export const FileDropzone = FileDropzoneBase as WithNativeAttributes<typeof FileDropzoneBase, NamedControl>;

export const Combobox = ComboboxBase as WithNativeAttributes<typeof ComboboxBase, NamedControl>;

export const DatePicker = DatePickerBase as WithNativeAttributes<typeof DatePickerBase, Pick<InputHTMLAttributes, 'id' | 'name' | 'form' | 'autocomplete'>>;

export const NavigationDrawer = NavigationDrawerBase as WithNativeAttributes<typeof NavigationDrawerBase, Pick<HTMLAttributes, 'id'>>;
