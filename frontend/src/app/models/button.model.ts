export interface Button {
  id: string;
  label: string;
  icon: string;
  variant: 'outline' | 'solid';
}

export const NAV_BUTTONS: Button[] = [
  {
    id: 'login',
    label: 'Prijava',
    icon: 'fa-solid fa-right-to-bracket',
    variant: 'outline'
  },
  {
    id: 'register',
    label: 'Registracija',
    icon: 'fa-solid fa-user-plus',
    variant: 'solid'
  }
];
