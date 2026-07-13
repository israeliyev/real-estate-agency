import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'İstifadəçi məlumatları',
    group: true,
  },
  {
    title: 'İstifadəçilər',
    icon: 'people-outline',
    link: '/pages/users',
    home: true,
  },
  {
    title: 'İzlənən Evlər',
    icon: 'eye-outline',
    link: '/pages/houses/watch',
    home: true,
  },
  {
    title: 'Seçilən Evlər',
    icon: 'heart-outline',
    link: '/pages/houses/like',
    home: true,
  },
  {
    title: 'Axtarılan Kateqoriyalar',
    icon: 'list-outline',
    link: '/pages/category/searching',
    home: true,
  },
  {
    title: 'Bütün Evlər',
    icon: 'home-outline',
    link: '/pages/houses',
    home: true,
  },
  {
    title: 'Əməliyyatlar',
    group: true,
  },
  {
    title: 'Makler Məlumatları',
    icon: 'person',
    link: '/pages/broker',
  },
  {
    title: 'Kateqoriyalar',
    icon: 'list-outline',
    link: '/pages/category-parameters',
  },
  {
    title: 'Ev Elanı Et',
    icon: 'home-outline',
    link: '/pages/house',
  },
  {
    title: 'Ev elan istəyləri',
    icon: 'home-outline',
    link: '/pages/house-requests',
    home: true,
  },
  {
    title: 'Bölmələr',
    icon: 'list-outline',
    link: '/pages/sections',
    home: true,
  },
  {
    title: 'Qeydlər',
    icon: 'list-outline',
    link: '/pages/notes',
    home: true,
  },
];
