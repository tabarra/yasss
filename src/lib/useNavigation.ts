import { useState, useEffect } from 'react';

export const useNavigation = () => {
    const getPath = () => {
        const hash = window.location.hash;
        return hash.startsWith('#') ? decodeURIComponent(hash.slice(1)) : '';
    };

    const [currentPath, setCurrentPath] = useState<string>(getPath());

    const setTitle = (path: string) => {
        if(path) {
            document.title = path.replace(/[\\/]/g, '/'); 
        } else {
            document.title = 'Yasss';
        }
    };

    const navigateTo = (path: string) => {
        window.location.hash = path ? `#${encodeURIComponent(path)}` : '';
        setCurrentPath(path);
        setTitle(path);
    };

    useEffect(() => {
        setTitle(currentPath);
    }, [currentPath]);

    useEffect(() => {
        const handleHashChange = () => {
            const newPath = getPath();
            setCurrentPath(newPath);
            setTitle(newPath);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    return { currentPath, navigateTo };
};
