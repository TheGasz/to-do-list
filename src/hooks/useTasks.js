import { useState, useEffect, useCallback } from "react";
import { getDeadlineStatus, XP_REWARDS } from "../utils/deadlineUtils";
import { db, auth } from "../firebase";
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";

const TASKS_KEY = "plan_tasks_v3";
const STATS_KEY = "plan_stats_v3";

const defaultTasks = [
  {
    id: 1,
    text: "Buat presentasi project",
    done: false,
    category: "💼 Kerja",
    deadline: (() => {
      const d = new Date(); d.setHours(d.getHours() + 3); return d.toISOString().slice(0, 16);
    })(),
    source: "manual",
    priority: "normal",
  },
  {
    id: 2,
    text: "Olahraga pagi 30 menit",
    done: false,
    category: "🎯 Goal",
    deadline: (() => {
      const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(7, 0); return d.toISOString().slice(0, 16);
    })(),
    source: "manual",
    priority: "normal",
  },
  {
    id: 3,
    text: "Beli bahan masak",
    done: false,
    category: "🛒 Belanja",
    deadline: (() => {
      const d = new Date(); d.setDate(d.getDate() + 3); d.setHours(17, 0); return d.toISOString().slice(0, 16);
    })(),
    source: "manual",
    priority: "normal",
  },
];

const defaultStats = {
  xp: 0,
  streak: 0,
  lastCompletedDate: null,
  totalCompleted: 0,
  totalAdded: 0,
  achievements: [],
};

function genId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export function useTasks() {
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TASKS_KEY)) || defaultTasks; } catch { return defaultTasks; }
  });
  const [stats, setStats] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STATS_KEY)) || defaultStats; } catch { return defaultStats; }
  });
  const [xpPopup, setXpPopup] = useState(null); // { amount, label }
  const [confetti, setConfetti] = useState(false);

  // Firestore Sync Effect
  useEffect(() => {
    if (!auth || !db) return; // If firebase config is empty
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // User logged in, sync from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const tasksColRef = collection(db, "users", user.uid, "tasks");

        // Listen to stats
        const unsubStats = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setStats(docSnap.data().stats || defaultStats);
          } else {
            setDoc(userDocRef, { stats: defaultStats });
          }
        });

        // Listen to tasks
        const unsubTasks = onSnapshot(tasksColRef, (snapshot) => {
          const fetchedTasks = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
          // Sort by creation or something if needed
          setTasks(fetchedTasks);
        });

        return () => { unsubStats(); unsubTasks(); };
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Local Storage Sync Effect (fallback)
  useEffect(() => { 
    if (!auth?.currentUser) {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); 
    }
  }, [tasks]);
  
  useEffect(() => { 
    if (!auth?.currentUser) {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats)); 
    }
  }, [stats]);

  // Helper to save stats to Firestore if logged in
  const saveStatsToFirestore = async (newStats) => {
    if (auth?.currentUser && db) {
      await setDoc(doc(db, "users", auth.currentUser.uid), { stats: newStats }, { merge: true });
    }
  };

  const gainXP = useCallback((amount, label) => {
    setStats((prev) => {
      const today = new Date().toDateString();
      const isNewDay = prev.lastCompletedDate !== today;
      const streakBonus = isNewDay && prev.streak > 0 ? XP_REWARDS.streak_bonus : 0;
      const totalXp = amount + streakBonus;
      const newStats = {
        ...prev,
        xp: (prev.xp || 0) + totalXp,
        streak: isNewDay ? (prev.streak || 0) + 1 : (prev.streak || 0),
        lastCompletedDate: today,
        totalCompleted: (prev.totalCompleted || 0) + 1,
      };
      saveStatsToFirestore(newStats);
      return newStats;
    });
    setXpPopup({ amount, label });
    setConfetti(true);
    setTimeout(() => {
      setXpPopup(null);
      setConfetti(false);
    }, 2500);
  }, []);

  const addTask = useCallback((text, category, deadline, source = "manual", priority = "normal") => {
    if (!text.trim()) return false;
    const newId = genId().toString();
    const newTask = {
      id: newId,
      text: text.trim(),
      done: false,
      category,
      deadline: deadline || "",
      source,
      priority,
      createdAt: new Date().toISOString(),
    };
    
    if (auth?.currentUser && db) {
      setDoc(doc(db, "users", auth.currentUser.uid, "tasks", newId), newTask);
      setStats((prev) => {
        const s = { ...prev, totalAdded: (prev.totalAdded || 0) + 1, xp: (prev.xp || 0) + XP_REWARDS.add_task };
        saveStatsToFirestore(s);
        return s;
      });
    } else {
      setTasks((prev) => [newTask, ...prev]);
      setStats((prev) => ({ ...prev, totalAdded: (prev.totalAdded || 0) + 1, xp: (prev.xp || 0) + XP_REWARDS.add_task }));
    }
    return true;
  }, []);

  const editTask = useCallback((id, changes) => {
    if (auth?.currentUser && db) {
      updateDoc(doc(db, "users", auth.currentUser.uid, "tasks", id.toString()), {
        ...changes, updatedAt: new Date().toISOString()
      });
    } else {
      setTasks((prev) =>
        prev.map((t) => t.id === id ? { ...t, ...changes, updatedAt: new Date().toISOString() } : t)
      );
    }
  }, []);

  const toggleTask = useCallback((id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newDone = !task.done;
    if (newDone) {
      const status = getDeadlineStatus(task.deadline, false);
      let xp = XP_REWARDS.complete_normal;
      let label = "+20 XP ✨";
      if (status === "urgent")  { xp = XP_REWARDS.complete_urgent;  label = "⚡ +50 XP Urgent!"; }
      else if (status === "overdue") { xp = XP_REWARDS.complete_overdue; label = "+10 XP Terlambat"; }
      gainXP(xp, label);
    }

    if (auth?.currentUser && db) {
      updateDoc(doc(db, "users", auth.currentUser.uid, "tasks", id.toString()), { done: newDone });
    } else {
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: newDone } : t));
    }
  }, [tasks, gainXP]);

  const deleteTask = useCallback((id) => {
    if (auth?.currentUser && db) {
      deleteDoc(doc(db, "users", auth.currentUser.uid, "tasks", id.toString()));
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  }, []);

  const clearCompleted = useCallback(() => {
    if (auth?.currentUser && db) {
      tasks.filter(t => t.done).forEach(t => {
        deleteDoc(doc(db, "users", auth.currentUser.uid, "tasks", t.id.toString()));
      });
    } else {
      setTasks((prev) => prev.filter((t) => !t.done));
    }
  }, [tasks]);

  /** Import array tasks dari LMS */
  const importTasks = useCallback((taskArray) => {
    if (auth?.currentUser && db) {
      taskArray.forEach(t => {
        const newId = genId().toString();
        const newTask = {
          id: newId,
          text: t.text.trim(),
          done: false,
          category: "📚 Tugas",
          deadline: t.deadline || "",
          source: t.source || "lms",
          priority: t.priority || "normal",
          createdAt: new Date().toISOString(),
        };
        setDoc(doc(db, "users", auth.currentUser.uid, "tasks", newId), newTask);
      });
      setStats((prev) => {
        const s = { ...prev, totalAdded: (prev.totalAdded || 0) + taskArray.length };
        saveStatsToFirestore(s);
        return s;
      });
    } else {
      const newTasks = taskArray.map((t) => ({
        id: genId(),
        text: t.text.trim(),
        done: false,
        category: "📚 Tugas",
        deadline: t.deadline || "",
        source: t.source || "lms",
        priority: t.priority || "normal",
        createdAt: new Date().toISOString(),
      }));
      setTasks((prev) => [...newTasks, ...prev]);
      setStats((prev) => ({ ...prev, totalAdded: (prev.totalAdded || 0) + newTasks.length }));
    }
    return taskArray.length;
  }, []);

  return { tasks, stats, addTask, editTask, toggleTask, deleteTask, clearCompleted, importTasks, xpPopup, confetti };
}