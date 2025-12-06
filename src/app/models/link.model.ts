export interface Link {
  text: string;
  href: string;
  icon?: string;
  external?: boolean;
}

export const FOOTER_LINKS: Link[] = [
  {
    text: 'O nas',
    href: '#about',
    icon: 'fa-solid fa-circle-info'
  },
  {
    text: 'Pogoji uporabe',
    href: '#terms',
    icon: 'fa-solid fa-file-lines'
  },
  {
    text: 'Zasebnost',
    href: '#privacy',
    icon: 'fa-solid fa-shield-halved'
  },
  {
    text: 'Kontakt',
    href: '#contact',
    icon: 'fa-solid fa-envelope'
  }
];
