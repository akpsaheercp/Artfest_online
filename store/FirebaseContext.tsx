import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getFirestore, collection, doc, onSnapshot, setDoc, updateDoc, 
    deleteDoc, getDoc, query, where, getDocs, writeBatch, arrayUnion, arrayRemove,
    collectionGroup
} from 'firebase/firestore';
import { 
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, 
    signOut, createUserWithEmailAndPassword 
} from 'firebase/auth';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { AppState, User, UserRole, ResultStatus, Result, TabulationEntry, ScheduledEvent, Team, Grade, Judge, CodeLetter, Participant, JudgeAssignment, Category, Item, Settings, Festival } from '../types';
import { DEFAULT_PAGE_PERMISSIONS, TABS, GUEST_PERMISSIONS } from '../constants';
import { sampleData } from '../sampleData';

const firebaseConfig = {
  apiKey: "AIzaSyBzwz61cfmOx97Ch34h2FqC9kGR8EighSE",
  authDomain: "festivalorganise.firebaseapp.com",
  projectId: "festivalorganise",
  storageBucket: "festivalorganise.firebasestorage.app",
  messagingSenderId: "973739669444",
  appId: "1:973739669444:web:ca5dc0d54278bc27721691"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

interface FirebaseContextType {
  state: AppState | null;
  currentFestival: Festival | null;
  currentUser: User | null;
  firebaseUser: any | null; 
  loading: boolean;
  isOnline: boolean;
  globalBackgroundLayers: string[];
  refreshGlobalBackgrounds: () => Promise<void>;
  globalFilters: any;
  setGlobalFilters: any;
  globalSearchTerm: string;
  setGlobalSearchTerm: any;
  dataEntryView: 'ITEMS' | 'PARTICIPANTS';
  setDataEntryView: (view: 'ITEMS' | 'PARTICIPANTS') => void;
  itemsSubView: 'ITEMS' | 'PARTICIPANTS';
  setItemsSubView: (v: 'ITEMS' | 'PARTICIPANTS') => void;
  teamsSubView: 'TEAMS' | 'CATEGORIES';
  setTeamsSubView: (v: 'TEAMS' | 'CATEGORIES') => void;
  gradeSubView: 'CODES' | 'GRADES';
  setGradeSubView: (v: 'CODES' | 'GRADES') => void;
  scoringSubView: 'QUEUE' | 'LEDGER';
  setScoringSubView: (v: 'QUEUE' | 'LEDGER') => void;
  judgesSubView: 'ASSIGNMENTS' | 'REGISTRY' | 'OVERVIEW';
  setJudgesSubView: (v: 'ASSIGNMENTS' | 'REGISTRY' | 'OVERVIEW') => void;
  settingsSubView: string;
  setSettingsSubView: (v: string) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (v: boolean) => void;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  createFestival: (name: string, slug: string) => Promise<string>;
  updateSettings: (payload: Partial<AppState['settings']>) => Promise<void>;
  updateLotPool: (payload: string[]) => Promise<void>;
  addCategory: (payload: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (payload: Category) => Promise<void>;
  deleteMultipleCategories: (ids: string[]) => Promise<void>;
  addTeam: (payload: Omit<Team, 'id'>) => Promise<void>;
  updateTeam: (payload: Team) => Promise<void>;
  deleteMultipleTeams: (ids: string[]) => Promise<void>;
  addItem: (payload: Omit<Item, 'id'>) => Promise<void>;
  updateItem: (payload: Item) => Promise<void>;
  deleteMultipleItems: (ids: string[]) => Promise<void>;
  saveResult: (payload: Result) => Promise<void>;
  updateTabulationEntry: (payload: TabulationEntry) => Promise<void>;
  addUser: (payload: Omit<User, 'id'>) => Promise<void>;
  updateUser: (payload: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  provisionUser: (payload: Omit<User, 'id'>, password: string) => Promise<void>;
  resetFestivalToSample: () => Promise<void>;
  resetSystem: () => Promise<void>;
  backupData: () => void;
  restoreData: (file: File) => Promise<void>;
  hasPermission: (tab: string) => boolean;
}

export const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentFestival, setCurrentFestival] = useState<Festival | null>(null);
  const [state, setState] = useState<AppState | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [globalBackgroundLayers, setGlobalBackgroundLayers] = useState<string[]>([]);

  // Fetch Global Backgrounds from Firebase Storage
  const fetchGlobalBackgrounds = useCallback(async () => {
    try {
      // Check cache first
      const cached = localStorage.getItem('global_backgrounds_cache');
      if (cached) {
        try {
          const { urls, timestamp } = JSON.parse(cached);
          // If cache is less than 1 hour old, use it but still refresh in background
          setGlobalBackgroundLayers(urls);
          if (Date.now() - timestamp < 3600000) {
            return;
          }
        } catch (e) {
          localStorage.removeItem('global_backgrounds_cache');
        }
      }

      const bucketNames = [
          firebaseConfig.storageBucket,
          `${firebaseConfig.projectId}.appspot.com`,
          `${firebaseConfig.projectId}.firebasestorage.app`
      ];
      
      const folderNames = ['Background_Layers', 'background_layers', 'Background-Layers', 'background-layers'];
      
      // Deduplicate bucket names
      const uniqueBuckets = Array.from(new Set(bucketNames.filter(Boolean)));

      // Parallelize bucket and folder scanning
      const fetchPromises = uniqueBuckets.flatMap(bucket => 
        folderNames.map(async (folder) => {
          try {
            const customStorage = getStorage(app, `gs://${bucket}`);
            const backgroundsRef = ref(customStorage, folder);
            const res = await listAll(backgroundsRef);
            return await Promise.all(res.items.map((item) => getDownloadURL(item)));
          } catch (e) {
            return [];
          }
        })
      );

      const results = await Promise.all(fetchPromises);
      const allUrls = results.flat();
      const uniqueUrls = Array.from(new Set(allUrls));

      if (uniqueUrls.length > 0) {
        setGlobalBackgroundLayers(uniqueUrls);
        localStorage.setItem('global_backgrounds_cache', JSON.stringify({
          urls: uniqueUrls,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error("Error fetching global background layers:", error);
    }
  }, []);

  useEffect(() => {
    fetchGlobalBackgrounds();
  }, [fetchGlobalBackgrounds, firebaseUser]);

  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // UI State
  const [globalFilters, setGlobalFilters] = useState({ teamId: [], categoryId: [], performanceType: [], itemType: [], itemId: [], status: [], date: [], stage: [], assignmentStatus: [] });
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [dataEntryView, setDataEntryView] = useState<'ITEMS' | 'PARTICIPANTS'>('ITEMS');
  const [itemsSubView, setItemsSubView] = useState<'ITEMS' | 'PARTICIPANTS'>('ITEMS');
  const [teamsSubView, setTeamsSubView] = useState<'TEAMS' | 'CATEGORIES'>('TEAMS');
  const [gradeSubView, setGradeSubView] = useState<'CODES' | 'GRADES'>('CODES');
  const [scoringSubView, setScoringSubView] = useState<'QUEUE' | 'LEDGER'>('QUEUE');
  const [judgesSubView, setJudgesSubView] = useState<'ASSIGNMENTS' | 'REGISTRY' | 'OVERVIEW'>('ASSIGNMENTS');
  const [settingsSubView, setSettingsSubView] = useState('details');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

    // Detect Festival from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const festSlug = params.get('f');
        
        if (festSlug) {
            const q = query(collection(db, 'festivals'), where('slug', '==', festSlug));
            getDocs(q).then(async (snap) => {
                if (!snap.empty) {
                    const fest = { id: snap.docs[0].id, ...snap.docs[0].data() } as Festival;
                    setCurrentFestival(fest);
                } else {
                    setLoading(false);
                }
            }).catch(err => {
                console.error("Fetch error:", err);
                setLoading(false);
            });
        } else if (firebaseUser) {
            // Auto-redirect to user's festival if no slug is provided
            const q = query(collection(db, 'festivals'), where('ownerId', '==', firebaseUser.uid));
            getDocs(q).then(snap => {
                if (!snap.empty) {
                    const fest = { id: snap.docs[0].id, ...snap.docs[0].data() } as Festival;
                    window.location.search = `?f=${fest.slug}`;
                } else {
                    setLoading(false);
                }
            }).catch(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [firebaseUser]);

    // Sync Data when Festival is detected
    useEffect(() => {
        if (!currentFestival) return;

        setLoading(true);
        const festId = currentFestival.id;
        
        // Initialize state with empty but complete structure to prevent crashes
        setState({
            festId,
            settings: sampleData.settings,
            instructions: {},
            lotPool: [],
            customFonts: {},
            generalCustomFonts: [],
            customBackgrounds: [],
            customTemplates: [],
            customFooters: [],
            categories: [],
            teams: [],
            items: [],
            gradePoints: sampleData.gradePoints,
            codeLetters: [],
            participants: [],
            schedule: [],
            judgeAssignments: [],
            tabulation: [],
            results: [],
            judges: [],
            users: [],
            permissions: sampleData.permissions
        });

        const unsubscribes: (() => void)[] = [];

    // Sync Settings
    unsubscribes.push(onSnapshot(doc(db, 'festivals', festId, 'config', 'settings'), (snap) => {
        const settings = snap.exists() ? snap.data() as Settings : sampleData.settings;
        setState(prev => ({ ...prev, festId, settings } as AppState));
        setLoading(false); // Only set loading false once settings arrive
    }));

    // Sync Subcollections (Generic helper)
    const syncCollection = (name: keyof AppState) => {
        return onSnapshot(collection(db, 'festivals', festId, name.toString()), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setState(prev => ({ ...prev, [name]: data } as AppState));
        });
    };

    const collectionsToSync: (keyof AppState)[] = [
        'categories', 'teams', 'items', 'participants', 
        'judges', 'users', 'schedule', 'results', 
        'tabulation', 'judgeAssignments', 'codeLetters'
    ];
    collectionsToSync.forEach(c => unsubscribes.push(syncCollection(c)));

    // Sync fixed lists and assets from metadata documents
    const configDocs = ['metadata', 'instructions', 'fonts', 'backgrounds'];
    configDocs.forEach(docName => {
        unsubscribes.push(onSnapshot(doc(db, 'festivals', festId, 'config', docName), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setState(prev => {
                    if (!prev) return prev;
                    const newState = { ...prev };
                    
                    if (docName === 'metadata') {
                        if (data.lotPool) newState.lotPool = data.lotPool;
                        if (data.permissions) newState.permissions = data.permissions;
                        if (data.gradePoints) newState.gradePoints = data.gradePoints;
                        // Backwards compatibility for combined metadata
                        if (data.instructions && !newState.instructions) newState.instructions = data.instructions;
                        if (data.customFonts && !newState.customFonts) newState.customFonts = data.customFonts;
                        if (data.generalCustomFonts && !newState.generalCustomFonts) newState.generalCustomFonts = data.generalCustomFonts;
                        if (data.customBackgrounds && !newState.customBackgrounds) newState.customBackgrounds = data.customBackgrounds;
                    }
                    
                    if (docName === 'instructions') {
                        newState.instructions = data.instructions || data || prev.instructions || {};
                    }
                    
                    if (docName === 'fonts') {
                        if (data.customFonts) newState.customFonts = data.customFonts;
                        if (data.generalCustomFonts) newState.generalCustomFonts = data.generalCustomFonts;
                    }
                    
                    if (docName === 'backgrounds') {
                        if (data.customBackgrounds) newState.customBackgrounds = data.customBackgrounds;
                        if (data.customTemplates) newState.customTemplates = data.customTemplates;
                        if (data.customFooters) newState.customFooters = data.customFooters;
                    }
                    
                    return newState as AppState;
                });
            }
        }));
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [currentFestival]);

    // Listen to Auth State
    useEffect(() => {
      const unsub = onAuthStateChanged(auth, (user) => {
          setFirebaseUser(user);
      });
      return () => unsub();
    }, []);

    // Auto-set currentUser based on state.users and firebaseUser
    useEffect(() => {
        if (state && firebaseUser && currentFestival) {
            const email = firebaseUser.email?.toLowerCase();
            const username = email?.split('@')[0] || 'manager';
            
            // 1. Check for manual registry entry
            let found = state.users.find(u => 
                u.username.toLowerCase() === username.toLowerCase() || 
                (u as any).email?.toLowerCase() === email
            );

            // 2. Owner Bypass
            // The owner is the one who created the fest (UID match)
            const isOwner = currentFestival.ownerId === firebaseUser.uid;

            if (found) {
                setCurrentUser(found);
                // Link UID to registry for security rules if not already linked
                if (found.id !== firebaseUser.uid) {
                    const uRef = doc(db, 'festivals', currentFestival.id, 'users', firebaseUser.uid);
                    setDoc(uRef, { ...found, id: firebaseUser.uid }, { merge: true });
                }
            } else if (isOwner) {
                // Synthetic Manager for Owner
                const syntheticUser: User = {
                    id: firebaseUser.uid,
                    username: username,
                    role: UserRole.MANAGER
                };
                // Adding email for future matches
                (syntheticUser as any).email = email;
                
                setCurrentUser(syntheticUser);

                // Auto-provision owner in DB if they are missing from the subcollection
                const uRef = doc(db, 'festivals', currentFestival.id, 'users', firebaseUser.uid);
                setDoc(uRef, syntheticUser, { merge: true });
            } else {
                setCurrentUser(null);
            }
        } else if (!firebaseUser) {
            setCurrentUser(null);
        }
    }, [state?.users, firebaseUser, currentFestival]);

    const login = async (emailOrHandle: string, pass: string, isHandle = false) => {
      let email = emailOrHandle;
      if (isHandle && !emailOrHandle.includes('@')) {
          // If it's a handle, we assume it's part of an email or we need to find it
          // For now, let's try the most common pattern: handle@gmail.com or handle@fest.com
          // Actually, many users might just type their full email in the handle box.
          // If they don't, we can't easily know their email without a lookup.
          // Let's assume handles are used with a default domain if provided.
          email = `${emailOrHandle}@fest.com`;
      }
      await signInWithEmailAndPassword(auth, email, pass);
    };

    const signup = async (email: string, pass: string) => {
      await createUserWithEmailAndPassword(auth, email, pass);
    };

    const logout = async () => {
      await signOut(auth);
      setCurrentUser(null);
    };

    const createFestival = async (name: string, slug: string) => {
        if (!auth.currentUser) throw new Error("Authentication required to create a festival.");

        const finalSlug = slug.toLowerCase().replace(/\s+/g, '-');
        
        // 1. Check for slug uniqueness
        const slugQ = query(collection(db, 'festivals'), where('slug', '==', finalSlug));
        const slugSnap = await getDocs(slugQ);
        if (!slugSnap.empty) {
            throw new Error("This URL slug is already in use. Please choose a different one.");
        }

        // 2. Check if user already owns a festival
        const existingQ = query(collection(db, 'festivals'), where('ownerId', '==', auth.currentUser.uid));
        const existingSnap = await getDocs(existingQ);
        if (!existingSnap.empty) {
            throw new Error("You already have an existing festival. You can only manage one per account.");
        }

        const festRef = doc(collection(db, 'festivals'));
        const creatorEmail = auth.currentUser.email || '';
        const creatorUsername = creatorEmail.split('@')[0];

        const fest: Festival = {
            id: festRef.id,
            slug: finalSlug,
            name,
            ownerId: auth.currentUser.uid,
            createdAt: Date.now(),
            isActive: true
        };
      await setDoc(festRef, fest);
      
      // Initialize configuration
      await setDoc(doc(db, 'festivals', festRef.id, 'config', 'settings'), sampleData.settings);
      await setDoc(doc(db, 'festivals', festRef.id, 'config', 'metadata'), {
          lotPool: sampleData.lotPool,
          permissions: sampleData.permissions,
          gradePoints: sampleData.gradePoints
      });
      await setDoc(doc(db, 'festivals', festRef.id, 'config', 'instructions'), {
          instructions: sampleData.instructions
      });
      await setDoc(doc(db, 'festivals', festRef.id, 'config', 'fonts'), {
          customFonts: {},
          generalCustomFonts: []
      });
      await setDoc(doc(db, 'festivals', festRef.id, 'config', 'backgrounds'), {
          customBackgrounds: [],
          customTemplates: [],
          customFooters: []
      });
      // Initialize subcollections
      const batch = writeBatch(db);
      
      // 1. Add Creator as Manager
      const managerRef = doc(collection(db, 'festivals', festRef.id, 'users'));
      batch.set(managerRef, { 
          id: auth.currentUser.uid, 
          username: creatorUsername, 
          email: creatorEmail, 
          role: UserRole.MANAGER 
      });

      await batch.commit();
      
      return fest.slug;
  };

  const updateSettings = async (p: any) => {
      if (!currentFestival) return;
      await updateDoc(doc(db, 'festivals', currentFestival.id, 'config', 'settings'), p);
  };

  const addDoc = async (col: string, data: any) => {
      if (!currentFestival) return;
      const ref = doc(collection(db, 'festivals', currentFestival.id, col));
      await setDoc(ref, { ...data, id: ref.id });
  };

  const updateDocData = async (col: string, id: string, data: any) => {
      if (!currentFestival) return;
      await updateDoc(doc(db, 'festivals', currentFestival.id, col, id), data);
  };

  const addMultipleDocs = async (col: string, items: any[]) => {
      if (!currentFestival || items.length === 0) return;
      const batch = writeBatch(db);
      items.forEach(item => {
          const ref = doc(collection(db, 'festivals', currentFestival.id, col));
          batch.set(ref, { ...item, id: ref.id });
      });
      await batch.commit();
  };

  const updateMultipleDocs = async (col: string, items: any[]) => {
      if (!currentFestival || items.length === 0) return;
      const batch = writeBatch(db);
      items.forEach(item => {
          const ref = doc(db, 'festivals', currentFestival.id, col, item.id);
          batch.set(ref, item, { merge: true });
      });
      await batch.commit();
  };

  const deleteMultipleDocs = async (col: string, ids: string[]) => {
      if (!currentFestival || ids.length === 0) return;
      const batch = writeBatch(db);
      ids.forEach(id => {
          const ref = doc(db, 'festivals', currentFestival.id, col, id);
          batch.delete(ref);
      });
      await batch.commit();
  };

  const resetFestivalToSample = async (isSilent = false) => {
      // Disabled since sample data logic is removed.
      console.warn("resetFestivalToSample is disabled.");
  };

  const resetSystem = async () => {
      if (!currentFestival) return;
      if (!confirm("FACTORY RESET: This will permanently delete ALL data, participants, items, and results. This action cannot be undone. Proceed?")) return;

      const festId = currentFestival.id;
      const batch = writeBatch(db);

      // 1. Reset Settings to bare defaults
      await setDoc(doc(db, 'festivals', festId, 'config', 'settings'), {
          ...sampleData.settings,
          organizingTeam: 'New Organizing Team',
          heading: 'New Festival',
          branding: {
              ...sampleData.settings.branding,
              eventName: 'New Festival',
              shortName: 'FEST'
          }
      });

      // 2. Reset Metadata documents
      await setDoc(doc(db, 'festivals', festId, 'config', 'metadata'), {
          lotPool: [],
          permissions: sampleData.permissions,
          gradePoints: sampleData.gradePoints
      });
      await setDoc(doc(db, 'festivals', festId, 'config', 'instructions'), {
          instructions: {}
      });
      await setDoc(doc(db, 'festivals', festId, 'config', 'fonts'), {
          customFonts: {},
          generalCustomFonts: []
      });
      await setDoc(doc(db, 'festivals', festId, 'config', 'backgrounds'), {
          customBackgrounds: [],
          customTemplates: [],
          customFooters: []
      });

      // 3. Delete documents in subcollections
      const collections = ['categories', 'teams', 'items', 'participants', 'judges', 'results', 'tabulation'];
      
      if (state) {
          collections.forEach(col => {
              const docs = (state as any)[col] || [];
              docs.forEach((d: any) => {
                  batch.delete(doc(db, 'festivals', festId, col, d.id || d.itemId));
              });
          });
          
          // Clear Users except current manager
          state.users.forEach(u => {
              if (u.username !== currentUser?.username && u.email !== firebaseUser?.email) {
                  batch.delete(doc(db, 'festivals', festId, 'users', u.id));
              }
          });
      }

      await batch.commit();
      alert("System purged. The terminal has been reset to factory defaults.");
      window.location.reload();
  };

  const contextValue: any = {
    state, currentFestival, currentUser, firebaseUser, loading, isOnline,
    globalBackgroundLayers,
    refreshGlobalBackgrounds: fetchGlobalBackgrounds,
    globalFilters, setGlobalFilters, globalSearchTerm, setGlobalSearchTerm,
    dataEntryView, setDataEntryView, itemsSubView, setItemsSubView, teamsSubView, setTeamsSubView, gradeSubView, setGradeSubView,
    scoringSubView, setScoringSubView, judgesSubView, setJudgesSubView, settingsSubView, setSettingsSubView,
    isOnboardingOpen, setIsOnboardingOpen,
    login, signup, logout, createFestival, updateSettings, resetFestivalToSample, resetSystem,
    addCategory: (p: any) => addDoc('categories', p),
    updateCategory: (p: any) => updateDocData('categories', p.id, p),
    deleteMultipleCategories: (ids: string[]) => deleteMultipleDocs('categories', ids),
    
    addTeam: (p: any) => addDoc('teams', p),
    updateTeam: (p: any) => updateDocData('teams', p.id, p),
    addMultipleTeams: (items: any[]) => addMultipleDocs('teams', items),
    deleteMultipleTeams: (ids: string[]) => deleteMultipleDocs('teams', ids),
    
    addItem: (p: any) => addDoc('items', p),
    updateItem: (p: any) => updateDocData('items', p.id, p),
    addMultipleItems: (items: any[]) => addMultipleDocs('items', items),
    deleteMultipleItems: (ids: string[]) => deleteMultipleDocs('items', ids),

    addParticipant: (p: any) => addDoc('participants', p),
    updateParticipant: (p: any) => updateDocData('participants', p.id, p),
    addMultipleParticipants: (items: any[]) => addMultipleDocs('participants', items),
    updateMultipleParticipants: (items: any[]) => updateMultipleDocs('participants', items),
    deleteMultipleParticipants: (ids: string[]) => deleteMultipleDocs('participants', ids),

    addUser: (p: any) => addDoc('users', p),
    updateUser: (p: any) => updateDocData('users', p.id, p),
    deleteUser: (id: string) => deleteMultipleDocs('users', [id]),
    provisionUser: async (userData: Omit<User, 'id'>, password: string) => {
        if (!currentFestival) throw new Error("No active festival selected.");
        if (!userData.email) throw new Error("Email is required for account provisioning.");

        // We use a secondary app instance to create a user without signing out the current manager
        const secondaryApp = initializeApp(firebaseConfig, "secondary");
        const secondaryAuth = getAuth(secondaryApp);
        
        try {
            const userCred = await createUserWithEmailAndPassword(secondaryAuth, userData.email, password);
            const uid = userCred.user.uid;

            // Add to Firestore
            const uRef = doc(db, 'festivals', currentFestival.id, 'users', uid);
            await setDoc(uRef, {
                ...userData,
                id: uid,
                password: password // Store for reference as requested
            });

            // Clean up secondary app
            await secondaryAuth.signOut();
        } catch (error) {
            console.error("Provisioning failed:", error);
            throw error;
        }
    },

    addGrade: async (p: any) => {
        if (!currentFestival || !state) return;
        const { itemType, grade } = p;
        const newGrade = { ...grade, id: `g_${Date.now()}` };
        const newGradePoints = { ...state.gradePoints, [itemType]: [...state.gradePoints[itemType], newGrade] };
        return updateDoc(doc(db, 'festivals', currentFestival.id, 'config', 'metadata'), { gradePoints: newGradePoints });
    },
    updateGrade: async (p: any) => {
        if (!currentFestival || !state) return;
        const { itemType, grade } = p;
        const newGradePoints = { ...state.gradePoints, [itemType]: state.gradePoints[itemType].map(g => g.id === grade.id ? grade : g) };
        return updateDoc(doc(db, 'festivals', currentFestival.id, 'config', 'metadata'), { gradePoints: newGradePoints });
    },
    deleteGrade: async (p: any) => {
        if (!currentFestival || !state) return;
        const { itemType, gradeId, id } = p;
        const targetId = gradeId || id;
        const newGradePoints = { ...state.gradePoints, [itemType]: state.gradePoints[itemType].filter(g => g.id !== targetId) };
        return updateDoc(doc(db, 'festivals', currentFestival.id, 'config', 'metadata'), { gradePoints: newGradePoints });
    },

    addCodeLetter: (p: any) => addDoc('codeLetters', p),
    addMultipleCodeLetters: (items: any[]) => addMultipleDocs('codeLetters', items),
    deleteCodeLetter: (id: string) => deleteMultipleDocs('codeLetters', [id]),
    deleteMultipleCodeLetters: (ids: string[]) => deleteMultipleDocs('codeLetters', ids),

    setSchedule: async (items: any[]) => {
        if (!currentFestival || !state) return;
        const batch = writeBatch(db);
        // Delete existing schedule
        state.schedule.forEach(s => {
            batch.delete(doc(db, 'festivals', currentFestival.id, 'schedule', s.id));
        });
        // Add new schedule
        items.forEach(item => {
            const ref = doc(db, 'festivals', currentFestival.id, 'schedule', item.id);
            batch.set(ref, item);
        });
        await batch.commit();
    },
    addScheduleEvent: (p: any) => addDoc('schedule', p),

    saveResult: (p: any) => {
        if (!currentFestival) return;
        return setDoc(doc(db, 'festivals', currentFestival.id, 'results', p.itemId), p, { merge: true });
    },
    updateTabulationEntry: (p: any) => updateDocData('tabulation', p.id, p),
    updateMultipleTabulationEntries: (items: any[]) => updateMultipleDocs('tabulation', items),
    deleteEventTabulation: async (itemId: string) => {
        if (!currentFestival || !state) return;
        const tabsToDelete = state.tabulation.filter(t => t.itemId === itemId).map(t => t.id);
        return deleteMultipleDocs('tabulation', tabsToDelete);
    },

    updateCustomFonts: async (fonts: any) => {
        if (!currentFestival) return;
        return setDoc(doc(db, 'festivals', currentFestival.id, 'config', 'fonts'), { customFonts: fonts }, { merge: true });
    },
    updateGeneralCustomFonts: async (fonts: any[]) => {
        if (!currentFestival) return;
        return setDoc(doc(db, 'festivals', currentFestival.id, 'config', 'fonts'), { generalCustomFonts: fonts }, { merge: true });
    },
    updateCustomBackgrounds: async (bgs: string[]) => {
        if (!currentFestival) return;
        return setDoc(doc(db, 'festivals', currentFestival.id, 'config', 'backgrounds'), { customBackgrounds: bgs }, { merge: true });
    },
    updatePermissions: async (role: string, tabs: string[]) => {
        if (!currentFestival || !state) return;
        const newPerms = { ...state.permissions, [role]: tabs };
        return setDoc(doc(db, 'festivals', currentFestival.id, 'config', 'metadata'), { permissions: newPerms }, { merge: true });
    },
    updateInstruction: async (p: { page: string, text: string }) => {
        if (!currentFestival || !state) return;
        const newInst = { ...state.instructions, [p.page]: p.text };
        return setDoc(doc(db, 'festivals', currentFestival.id, 'config', 'instructions'), { instructions: newInst }, { merge: true });
    },
    updateLotPool: async (pool: string[]) => {
        if (!currentFestival) return;
        return setDoc(doc(db, 'festivals', currentFestival.id, 'config', 'metadata'), { lotPool: pool }, { merge: true });
    },
    backupData: () => {
        if (!state) return;
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${currentFestival?.slug || 'fest'}-${Date.now()}.json`;
        a.click();
    },
    restoreData: async (file: File) => {
        if (!currentFestival || !state) return;

        return new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string) as AppState;
                    if (!data.settings || !data.categories) {
                        throw new Error("Invalid backup file format.");
                    }

                    setLoading(true);
                    const festId = currentFestival.id;

                    // 1. Update Config (Non-batched, split into multiple docs to avoid 1MB limit)
                    await setDoc(doc(db, 'festivals', festId, 'config', 'settings'), data.settings);
                    
                    await setDoc(doc(db, 'festivals', festId, 'config', 'metadata'), {
                        lotPool: data.lotPool || [],
                        permissions: data.permissions || sampleData.permissions,
                        gradePoints: data.gradePoints || sampleData.gradePoints,
                    });

                    await setDoc(doc(db, 'festivals', festId, 'config', 'instructions'), {
                        instructions: data.instructions || {}
                    });

                    await setDoc(doc(db, 'festivals', festId, 'config', 'fonts'), {
                        customFonts: data.customFonts || {},
                        generalCustomFonts: data.generalCustomFonts || [],
                    });

                    await setDoc(doc(db, 'festivals', festId, 'config', 'backgrounds'), {
                        customBackgrounds: data.customBackgrounds || [],
                        customTemplates: data.customTemplates || [],
                        customFooters: data.customFooters || []
                    });

                    // 2. Clear subcollections with chunked batches
                    const collections = [
                        'categories', 'teams', 'items', 'participants', 
                        'judges', 'users', 'schedule', 'results', 
                        'tabulation', 'judgeAssignments', 'codeLetters'
                    ];

                    let batch = writeBatch(db);
                    let opCount = 0;

                    const commitBatch = async () => {
                        if (opCount > 0) {
                            await batch.commit();
                            batch = writeBatch(db);
                            opCount = 0;
                        }
                    };

                    for (const col of collections) {
                        const existingDocs = (state as any)[col] || [];
                        for (const d of existingDocs) {
                            const id = d.id || (col === 'results' ? d.itemId : null);
                            if (id) {
                                batch.delete(doc(db, 'festivals', festId, col, id));
                                opCount++;
                                if (opCount >= 400) await commitBatch();
                            }
                        }
                    }
                    await commitBatch();

                    // 3. Populate new data with chunked batches
                    for (const col of collections) {
                        const items = (data as any)[col] || [];
                        for (const item of items) {
                            const id = item.id || (col === 'results' ? item.itemId : null);
                            if (id) {
                                batch.set(doc(db, 'festivals', festId, col, id), item);
                                opCount++;
                                if (opCount >= 400) await commitBatch();
                            }
                        }
                    }
                    await commitBatch();

                    alert("System restored successfully!");
                    window.location.reload();
                    resolve();
                } catch (err) {
                    console.error("Restore failed:", err);
                    alert("Failed to restore data: " + (err as Error).message);
                    setLoading(false);
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error("Failed to read file."));
            reader.readAsText(file);
        });
    },
    hasPermission: (tab: string) => {
        if (GUEST_PERMISSIONS.includes(tab)) return true;
        if (!currentUser) return false;
        return state?.permissions?.[currentUser.role]?.includes(tab) || false;
    }
  };

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};