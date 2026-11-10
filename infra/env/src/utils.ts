import os from 'node:os';

import { z } from 'zod';

export const booleanEnv = (defaultValue = false) =>
    z.preprocess((val) => {
        if (typeof val === 'boolean') return val;
        if (typeof val === 'string') {
            const normalized = val.trim().toLowerCase();
            if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
            if (['false', '0', 'no', 'off', ''].includes(normalized))
                return false;
        }
        return val;
    }, z.boolean().default(defaultValue));

/**
 * Определяет локальный сетевой IP-адрес хоста (LAN IP), доступный другим устройствам
 * в локальной сети (Wi-Fi/Ethernet). Если внешний IP не найден, возвращает 127.0.0.1.
 */
export const getLocalIp = (): string => {
    try {
        const interfaces = os.networkInterfaces();

        // 1. Приоритет: физические и беспроводные интерфейсы (wl*, en*, eth*)
        for (const [name, addrs] of Object.entries(interfaces)) {
            if (!addrs) continue;
            if (
                name.startsWith('wl') ||
                name.startsWith('en') ||
                name.startsWith('eth')
            ) {
                for (const addr of addrs) {
                    if (addr.family === 'IPv4' && !addr.internal) {
                        return addr.address;
                    }
                }
            }
        }

        // 2. Любой не-internal IPv4, исключая виртуальные/docker/мостовые интерфейсы
        for (const [name, addrs] of Object.entries(interfaces)) {
            if (
                !addrs ||
                name.startsWith('docker') ||
                name.startsWith('br-') ||
                name.startsWith('veth') ||
                name.startsWith('happ-')
            ) {
                continue;
            }
            for (const addr of addrs) {
                if (addr.family === 'IPv4' && !addr.internal) {
                    return addr.address;
                }
            }
        }
    } catch {
        // Fallback
    }

    return '127.0.0.1';
};
