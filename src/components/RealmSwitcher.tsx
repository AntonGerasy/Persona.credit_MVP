import React, { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';

const RealmSwitcher: React.FC = () => {
    const [realm, setRealm] = useState<'mirkwood' | 'rivendell'>(() => {
        return (localStorage.getItem('dossier_realm') as any) || 'mirkwood';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (realm === 'rivendell') {
            root.style.setProperty('--bg-main-terminal', '#CCCCCC');
        } else {
            root.style.setProperty('--bg-main-terminal', '#0F292F');
        }
        localStorage.setItem('dossier_realm', realm);
    }, [realm]);

    const toggleRealm = () => {
        setRealm(prev => prev === 'mirkwood' ? 'rivendell' : 'mirkwood');
    };

    return (
        <button
            onClick={toggleRealm}
            title="Change Realm"
            className="p-1 px-2 text-cyber-silver/20 hover:text-cyber-teal transition-all duration-700 cursor-pointer flex items-center justify-center opacity-40 hover:opacity-100"
            aria-label="Change Realm"
        >
            <Leaf size={10} className={`${realm === 'rivendell' ? 'rotate-180 text-cyber-teal/60' : ''} transition-transform duration-700`} />
        </button>
    );
};

export default RealmSwitcher;
