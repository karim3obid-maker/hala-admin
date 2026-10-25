import {useSyncExternalStore} from 'react';
import {subscribe,getSnapshot} from './adminStore.js';
export default function useAdminStore(){return useSyncExternalStore(subscribe,getSnapshot,getSnapshot)}
