export interface Link {
  text: string;
  path?: string;
  href?: string;
  icon?: string;
  external?: boolean;
}

export const FOOTER_LINKS: Link[] = [
  {
    text: 'O nas',
    path: '/o-nas',
    icon: 'fa-solid fa-circle-info'
  },
  {
    text: 'Pogoji uporabe',
    path: '/pogoji-uporabe',
    icon: 'fa-solid fa-file-lines'
  },
  {
    text: 'Zasebnost',
    path: '/zasebnost',
    icon: 'fa-solid fa-shield-halved'
  },
  {
    text: 'Kontakt',
    path: '/kontakt',
    icon: 'fa-solid fa-envelope'
  }
];
