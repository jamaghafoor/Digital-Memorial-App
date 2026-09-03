import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { api } from '../api/client'; import type { User } from '../types';
type AuthValue = { user?:User; loading:boolean; login:(email:string,password:string)=>Promise<void>; register:(name:string,email:string,password:string)=>Promise<void>; logout:()=>Promise<void>; };
const AuthContext = createContext<AuthValue>({} as AuthValue);
export const AuthProvider = ({children}:PropsWithChildren) => { const [user,setUser]=useState<User>(); const [loading,setLoading]=useState(true); useEffect(()=>{AsyncStorage.getItem('user').then((saved)=>saved&&setUser(JSON.parse(saved))).finally(()=>setLoading(false));},[]); const keep=async(data:{token:string;user:User})=>{await AsyncStorage.multiSet([['token',data.token],['user',JSON.stringify(data.user)]]);setUser(data.user);}; return <AuthContext.Provider value={{user,loading,login:async(email,password)=>keep((await api.post('/auth/login',{email,password})).data),register:async(name,email,password)=>keep((await api.post('/auth/register',{name,email,password})).data),logout:async()=>{await AsyncStorage.multiRemove(['token','user']);setUser(undefined);}}}>{children}</AuthContext.Provider>; };
export const useAuth=()=>useContext(AuthContext);
