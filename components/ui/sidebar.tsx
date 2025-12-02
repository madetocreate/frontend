use client'

import { useEffect, useRef, useState } from 'react'
import { useAppProvider } from '@/app/app-provider'
import { useSelectedLayoutSegments } from 'next/navigation'
import { useWindowWidth } from '@/components/utils/use-window-width'
import SidebarLinkGroup from './sidebar-link-group'
import SidebarLink from './sidebar-link'
import Logo from './logo'

export default function Sidebar( {
  variant = 'default',
}: {
  variant?: 'default' | 'v2'
}) {
  const sidebaq!��/��@HN���M1�q�NG�QRcB6�&���f����7W'&V�B"����3�&�GG���wwr�s2��&r�#�7fr"v�GF��#b"�V�v�C�#b"f�Wt&���#bb#��F�C�$�Rf��c"cF���