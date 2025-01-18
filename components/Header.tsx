'use client';

import React from 'react'
import Link from 'next/link'
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation'

const Header = () => {
    const pathname = usePathname();

    return (
        <header className='flex justify-between my-10 gap-5'>
            <Link href="/">
                <Image src='/icons/logo.svg' alt='logo' width={40} height={40} />
            </Link>

            <ul className='flex flex-row items-center gap-8'>
                <li>
                    <Link href='/library' className={cn('text-base cursor-pointer capitalize', pathname === '/library' ? 'text-light-200' : 'text-light-100')}>
                        Library
                    </Link>
                </li>
            </ul>
        </header>
    )
}

export default Header;
