import React, {useEffect,useRef,useState} from 'react';
import {ActivityIndicator, Alert, Animated, BackHandler, Easing, Dimensions, Image, KeyboardAvoidingView, Linking, AppState, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as Application from 'expo-application';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as FileSystem from 'expo-file-system/legacy';
import ViewShot from 'react-native-view-shot';
import {ACCENTS, DESIGNS, InvitationCard, NEW_INVITE, OCCASIONS} from './src/designs';
const {checkForBetaUpdate} = require('./src/betaUpdateFeed');
const {exportInvitationPng} = require('./src/pngExport');
const {createWorkingCopyStore} = require('./src/workingCopy');
const {readLocalDrafts,writeLocalDrafts,inspectRecoverySnapshot,inspectStorageHealth,makeBackupFile,readBackupFile,mergeBackup} = require('./src/draftStorage');

const C={bg:'#171310',panel:'#24201C',panel2:'#30271F',gold:'#D6B174',soft:'#F9EDDB',muted:'#AEA194',line:'#4D4033',rose:'#C9928B'};
const BETA_VERSION='1.1.11';
const nowId=()=>String(Date.now())+'-'+Math.random().toString(36).slice(2,7);
// Keep template-gallery sample names, but never prefill a real new invitation with demo wedding details.
const makeNew=(designId='rajwada')=>({...NEW_INVITE,id:null,designId,bride:'',groom:'',date:'',time:'',venue:'',host:'',message:'',relatives:'',rsvp:''});
const Small=({children,style})=><Text style={[{color:C.muted,fontSize:11,lineHeight:17},style]}>{children}</Text>;
const Label=({children})=><Text style={{color:C.gold,fontSize:10,fontWeight:'700',letterSpacing:2,marginBottom:10}}>{children}</Text>;
const GoldButton=({title,onPress,outline=false,disabled=false,style})=><Pressable disabled={disabled} onPress={onPress} accessibilityRole="button" style={[{paddingVertical:15,paddingHorizontal:18,borderRadius:13,backgroundColor:outline?'transparent':C.gold,borderWidth:1,borderColor:C.gold,alignItems:'center',justifyContent:'center',opacity:disabled?.5:1},style]}><Text style={{fontSize:12,fontWeight:'800',color:outline?C.gold:C.bg,letterSpacing:.5}}>{title}</Text></Pressable>;
const FancyTitle=({top,title,subtitle})=><View style={{marginBottom:22}}><Label>{top}</Label><Text style={s.heading}>{title}</Text>{subtitle?<Small style={{marginTop:9,fontSize:12}}>{subtitle}</Small>:null}</View>;
const Section=({children,style})=><View style={[{backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:19,padding:16,marginBottom:15},style]}>{children}</View>;

function RoyalDoorIntro({onFinish}) {
  const left=useRef(new Animated.Value(0)).current;
  const right=useRef(new Animated.Value(0)).current;
  const glow=useRef(new Animated.Value(0)).current;
  const finishing=useRef(false);
  const timers=useRef([]);
  const finish=()=>{if(finishing.current)return;finishing.current=true;onFinish();};
  useEffect(()=>{
    timers.current.push(setTimeout(()=>{
      Animated.parallel([
        Animated.timing(left,{toValue:1,duration:1350,easing:Easing.inOut(Easing.cubic),useNativeDriver:true}),
        Animated.timing(right,{toValue:1,duration:1350,easing:Easing.inOut(Easing.cubic),useNativeDriver:true}),
        Animated.timing(glow,{toValue:1,duration:900,easing:Easing.out(Easing.quad),useNativeDriver:true})
      ]).start(({finished})=>{if(finished)timers.current.push(setTimeout(finish,300));});
    },750));
    return()=>{timers.current.forEach(clearTimeout);left.stopAnimation();right.stopAnimation();glow.stopAnimation();};
  },[]);
  const moveLeft=left.interpolate({inputRange:[0,1],outputRange:[0,-Dimensions.get('window').width/2]});
  const moveRight=right.interpolate({inputRange:[0,1],outputRange:[0,Dimensions.get('window').width/2]});
  return <View style={s.introWrap}>
    <LinearGradient colors={['#180F12','#663F26','#E7C589']} style={StyleSheet.absoluteFill}/>
    <Animated.View style={[s.introLight,{opacity:glow}]}><Text style={{color:'#FDE9BD',fontSize:44}}>✺</Text><Text style={{color:'#FFF6E3',fontSize:42,fontFamily:'serif',textAlign:'center'}}>Welcome to{ '\n' }VivahSutra</Text><Text style={{color:'#F5DDB7',letterSpacing:3,fontSize:11,marginTop:12}}>YOUR FOREVER BEGINS HERE</Text></Animated.View>
    {['left','right'].map(side=><Animated.View key={side} style={[s.door,side==='left'?{left:0,borderRightWidth:3,transform:[{translateX:moveLeft},{perspective:800},{rotateY:left.interpolate({inputRange:[0,1],outputRange:['0deg','-14deg']})}]}:{right:0,borderLeftWidth:3,transform:[{translateX:moveRight},{perspective:800},{rotateY:right.interpolate({inputRange:[0,1],outputRange:['0deg','14deg']})}]}]}>
      <LinearGradient colors={side==='left'?['#3C2420','#1A1010']:['#1A1010','#3C2420']} style={StyleSheet.absoluteFill}/>
      <View style={s.doorOrnament}><Text style={{fontSize:27,color:C.gold}}>❦</Text><Text style={{color:C.gold,fontSize:72,opacity:.85}}>✧</Text><Text style={{color:C.gold,fontSize:28}}>❦</Text></View>
      <View style={[s.doorHandle,side==='left'?{right:11}:{left:11}]}/>
    </Animated.View>)}
    <View pointerEvents="none" style={s.introTitle}><Text style={{color:'#FAE6C5',fontSize:30,fontFamily:'serif'}}>VivahSutra</Text><Text style={{color:C.gold,fontSize:10,letterSpacing:4,marginTop:6}}>THE ART OF INVITING</Text></View>
    <Pressable style={s.introSkip} accessibilityRole="button" onPress={finish}><Text style={{color:'#FAEAD0',fontSize:12}}>Skip intro  ↗</Text></Pressable>
  </View>;
}

function AppContent(){
  const [tab,setTab]=useState('home');
  const [intro,setIntro]=useState(true);
  const [designFilter,setDesignFilter]=useState('All');
  const [selectedDesignId,setSelectedDesignId]=useState(null);
  const [invite,setInvite]=useState(makeNew());
  const [side,setSide]=useState('front');
  const [drafts,setDrafts]=useState([]);
  const [loaded,setLoaded]=useState(false);
  const [storageError,setStorageError]=useState(false);
  const [storageHealth,setStorageHealth]=useState(null);
  const [storageChecking,setStorageChecking]=useState(false);
  const [busy,setBusy]=useState(false);
  const exportInFlight=useRef(false);
  const [hasUnsavedEdits,setHasUnsavedEdits]=useState(false);
  const [workingCandidate,setWorkingCandidate]=useState(null);
  const [workingLoaded,setWorkingLoaded]=useState(false);
  const [workingCopyError,setWorkingCopyError]=useState(false);
  const workingCopyStore=useRef(null);
  if(!workingCopyStore.current)workingCopyStore.current=createWorkingCopyStore(AsyncStorage);
  const [saving,setSaving]=useState(false);
  const savingInFlight=useRef(false);
  const draftWriteInFlight=useRef(false);
  const draftsRef=useRef([]);
  const backupActionInFlight=useRef(false);
  const [backupBusy,setBackupBusy]=useState(false);
  const [betaUpdate,setBetaUpdate]=useState(null);
  const [updateStatus,setUpdateStatus]=useState('idle');
  const updateInFlight=useRef(false);
  const updateLastCheckedAt=useRef(0);
  
  const shot=useRef(null);
  const listRef=useRef(null);
  const installedBuildCode=Number(Application.nativeBuildVersion || 0);
  const checkUpdates=async(manual=false)=>{
    if(updateInFlight.current)return;
    updateInFlight.current=true;
    updateLastCheckedAt.current=Date.now();
    setUpdateStatus('checking');
    try{
      const result=await checkForBetaUpdate(installedBuildCode,fetch);
      setBetaUpdate(result.status==='available'?result:null);
      setUpdateStatus(result.status);
      if(manual){
        const title=result.status==='available'?'Update available':result.status==='current'?'App is up to date':result.status==='unavailable'?'Beta not published yet':'Cannot compare builds';
        const message=result.status==='available'?'VivahSutra '+result.versionName+' (build '+result.versionCode+') is available. Tap the Update button to download it.':result.status==='current'?'You already have the latest available beta APK.':result.status==='unavailable'?'No public beta release is available yet. Please check later.':'This installed APK has no readable Android build number.';
        if(result.status==='available'){
          Alert.alert(title,message,[
            {text:'Later',style:'cancel'},
            {text:'Download update',onPress:()=>confirmBetaDownload(result.apkUrl)}
          ]);
        }else{
          Alert.alert(title,message);
        }
      }
    }catch(e){
      setUpdateStatus('error');
      if(manual)Alert.alert('Update check failed','Could not reach GitHub beta updates. Check internet access and try again.');
    }finally{updateInFlight.current=false;}
  };
  const confirmBetaDownload=(apkUrl)=>{
    if(!apkUrl)return;
    Alert.alert('Install beta update?','The APK will download using your browser. Android will ask permission before installing. Do not uninstall the current app or clear its data.',[
      {text:'Cancel',style:'cancel'},
      {text:'Download update',onPress:async()=>{
        try{await Linking.openURL(apkUrl);}
        catch(e){Alert.alert('Download unavailable','Could not open the update link. Check your internet connection.');}
      }}
    ]);
  };
  const openBetaUpdate=()=>confirmBetaDownload(betaUpdate?.apkUrl);
  useEffect(()=>{
    checkUpdates(false);
    const sub=AppState.addEventListener('change',state=>{
      if(state==='active'&&Date.now()-updateLastCheckedAt.current>30*60*1000)checkUpdates(false);
    });
    return()=>sub.remove();
  },[]);
  const checkLocalStorage=async()=>{
    if(draftWriteInFlight.current||storageChecking)return;
    setStorageChecking(true);
    try{
      const health=await inspectStorageHealth(AsyncStorage);
      setStorageHealth(health);
    }catch(e){
      Alert.alert('Storage check unavailable','Could not inspect local storage. No invitation data was changed.');
    }finally{setStorageChecking(false);}
  };
  const loadDrafts=async()=>{
    if(draftWriteInFlight.current)return;
    try{
      const result=await readLocalDrafts(AsyncStorage);
      draftsRef.current=result.drafts;
      setDrafts(result.drafts);
      setStorageError(false);
      if(result.recovered)Alert.alert('Invitations recovered','A damaged or missing local list was restored from this app’s recovery copy.');
    }catch(e){
      setStorageError(true);
      Alert.alert('Drafts unavailable','Could not safely read local invitations. Saving and deleting are paused. Do not uninstall; retry or restore an exported backup.');
    }finally{setLoaded(true);}
  };
  useEffect(()=>{loadDrafts();},[]);
  useEffect(()=>{
    let active=true;
    workingCopyStore.current.read().then(copy=>{
      if(active&&copy)setWorkingCandidate(copy);
    }).catch(()=>{if(active)setWorkingCopyError(true);})
      .finally(()=>{if(active)setWorkingLoaded(true);});
    return()=>{active=false;};
  },[]);
  useEffect(()=>{
    if(!workingLoaded||!hasUnsavedEdits)return;
    workingCopyStore.current.save(invite).catch(()=>setWorkingCopyError(true));
  },[invite,hasUnsavedEdits,workingLoaded]);
  useEffect(()=>{
    const subscription=BackHandler.addEventListener('hardwareBackPress',()=>{
      if(intro){setIntro(false);return true;}
      if(tab==='editor'&&hasUnsavedEdits){
        Alert.alert('Unsaved invitation','Your changes are not saved. You can resume them from Home or Create while this app stays open.',[
          {text:'Keep editing',style:'cancel'},
          {text:'Leave editor',onPress:()=>setTab('home')}
        ]);
        return true;
      }
      if(tab!=='home'){setTab('home');return true;}
      return false;
    });
    return()=>subscription.remove();
  },[tab,intro,hasUnsavedEdits]);
  const editField=(field,value)=>{setHasUnsavedEdits(true);setInvite(p=>({...p,[field]:value}));};
  const switchLanguage=(language)=>{
    setHasUnsavedEdits(true);
    setInvite(p=>({
      ...p,language,
      host:language==='hi'&&p.host===NEW_INVITE.host?'परिवार सहित सादर आमंत्रित':language==='en'&&p.host==='परिवार सहित सादर आमंत्रित'?NEW_INVITE.host:p.host,
      message:language==='hi'&&p.message===NEW_INVITE.message?'आपकी उपस्थिति हमारे समारोह को और भी सुंदर बनाएगी।':language==='en'&&p.message==='आपकी उपस्थिति हमारे समारोह को और भी सुंदर बनाएगी।'?NEW_INVITE.message:p.message
    }));
  };
  const resumeSavedWork=()=>{
    if(!workingCandidate)return;
    setInvite({...makeNew(workingCandidate.invite.designId||'rajwada'),...workingCandidate.invite});
    setSide('front');
    setWorkingCandidate(null);
    setHasUnsavedEdits(true);
    setTab('editor');
  };
  const confirmDiscard=(proceed)=>{
    if(!workingLoaded){Alert.alert('Loading unfinished work','Checking for an unfinished invitation. Please try again.');return;}
    if(workingCopyError){
      Alert.alert('Unfinished work unavailable','The old unfinished-work record could not be read. Nothing will be overwritten until you review storage.');
      return;
    }
    if(!hasUnsavedEdits&&!workingCandidate){proceed();return;}
    Alert.alert('Discard unfinished invitation?','Starting another invitation will remove its unsaved working copy on this device. Saved invitations will stay unchanged.',[
      {text:'Keep editing',style:'cancel',onPress:()=>workingCandidate?resumeSavedWork():setTab('editor')},
      {text:'Discard unfinished',style:'destructive',onPress:async()=>{
        try{
          await workingCopyStore.current.clear();
          setWorkingCandidate(null);
          setHasUnsavedEdits(false);
          proceed();
        }catch(e){
          setWorkingCopyError(true);
          Alert.alert('Could not discard','Unfinished local work was not safely cleared. No new invitation was started.');
        }
      }}
    ]);
  };
  const newInvite=(designId='rajwada')=>confirmDiscard(()=>{setInvite(makeNew(designId));setHasUnsavedEdits(false);setSide('front');setTab('editor');});
  const editSaved=(data)=>confirmDiscard(()=>{setInvite({...makeNew(),...data});setHasUnsavedEdits(false);setSide('front');setTab('editor');});
  const save=async()=>{
    if(!loaded){Alert.alert('Loading drafts','Your saved invitations are still loading. Please try again.');return;}
    if(storageError){Alert.alert('Drafts unavailable','Please retry loading saved invitations before saving, so existing drafts are not overwritten.');return;}
    if(!invite.bride?.trim()||!invite.groom?.trim()){Alert.alert('Names required','Add both names before saving your invitation.');return;}
    if(savingInFlight.current||draftWriteInFlight.current)return;
    savingInFlight.current=true;
    draftWriteInFlight.current=true;
    setSaving(true);
    const id=invite.id||nowId();
    const entry={...invite,id,createdAt:invite.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
    const previous=draftsRef.current;
    const next=[entry,...previous.filter(d=>d.id!==id)];
    try{
      const result=await writeLocalDrafts(AsyncStorage,previous,next);
      draftsRef.current=next;
      setDrafts(next);
      setInvite(entry);
      setHasUnsavedEdits(false);
      let workingCleared=true;
      try{
        await workingCopyStore.current.clear();
        setWorkingCandidate(null);
      }catch(e){
        workingCleared=false;
        setWorkingCopyError(true);
      }
      Alert.alert('Invitation saved',(result.backupSynced?'Your invitation and its local recovery copy are saved.':'Invitation saved, but the recovery copy could not be refreshed. Export a backup file from Saved.')+(workingCleared?'':' Your unsaved working copy could not be cleared.'));
    }catch(e){
      if(e?.code==='RECOVERY_REQUIRED'){
        Alert.alert('Older invitations protected','The recovery copy contains invitations missing from Saved. Go to Saved → RECOVER FROM LOCAL COPY before saving. Nothing was overwritten.');
      }else{
        setStorageError(true);
        Alert.alert('Save paused','Local storage changed or is unavailable. Existing invitations were not intentionally overwritten. Use Saved → Retry Loading before saving again.');
      }
    }finally{savingInFlight.current=false;draftWriteInFlight.current=false;setSaving(false);}
  };
  const remove=(id)=>{
    if(!loaded||storageError||draftWriteInFlight.current){Alert.alert('Drafts unavailable','Retry loading your invitations before deleting anything.');return;}
    Alert.alert('Delete invitation?','This deletes this local draft. Export a backup first if you want a separate copy.',[
    {text:'Cancel',style:'cancel'},
    {text:'Delete',style:'destructive',onPress:async()=>{
      if(draftWriteInFlight.current)return;
      draftWriteInFlight.current=true;
      const previous=draftsRef.current;
      const next=previous.filter(x=>x.id!==id);
      try{
        const result=await writeLocalDrafts(AsyncStorage,previous,next);
        draftsRef.current=next;
        setDrafts(next);
        if(!result.backupSynced)Alert.alert('Backup warning','Deletion succeeded, but the local recovery copy could not be refreshed.');
      }catch(e){
        if(e?.code==='RECOVERY_REQUIRED')Alert.alert('Recovery needed','Missing invitations exist in the local recovery copy. Review Saved → RECOVER FROM LOCAL COPY before deleting anything.');
        else{setStorageError(true);Alert.alert('Delete paused','Storage changed or is unavailable. Reload saved invitations before trying again.');}
      }
      finally{draftWriteInFlight.current=false;}
    }}
    ]);
  };
  const exportBackup=async()=>{
    if(!loaded||storageError||draftWriteInFlight.current||backupActionInFlight.current){
      Alert.alert('Backup unavailable','Reload your invitations and try again.');return;
    }
    if(!draftsRef.current.length){Alert.alert('No saved invitations','No local invitations are available to export on this phone.');return;}
    backupActionInFlight.current=true;
    setBackupBusy(true);
    try{
      if(!await Sharing.isAvailableAsync())throw new Error('Sharing unavailable');
      const base=FileSystem.cacheDirectory||FileSystem.documentDirectory;
      if(!base)throw new Error('File storage unavailable');
      const target=base+'VivahSutra-Invitations-Backup-'+Date.now()+'.json';
      await FileSystem.writeAsStringAsync(target,makeBackupFile(draftsRef.current,new Date().toISOString()));
      await Sharing.shareAsync(target,{mimeType:'application/json',dialogTitle:'Save your VivahSutra backup to Files or Drive'});
    }catch(e){Alert.alert('Backup not shared','Could not share a backup file. Your local invitations are unchanged.');}
    finally{backupActionInFlight.current=false;setBackupBusy(false);}
  };
  const importBackup=async()=>{
    if(!loaded||storageError||draftWriteInFlight.current||backupActionInFlight.current){
      Alert.alert('Restore unavailable','Reload saved invitations before restoring a file.');return;
    }
    backupActionInFlight.current=true;
    setBackupBusy(true);
    try{
      const picked=await DocumentPicker.getDocumentAsync({type:'application/json',copyToCacheDirectory:true});
      if(picked.canceled||!picked.assets?.[0]?.uri)return;
      const asset=picked.assets[0];
      if(asset.size!=null&&asset.size>2100000)throw new Error('Backup file too large');
      const content=await FileSystem.readAsStringAsync(asset.uri);
      const imported=readBackupFile(content);
      const preview=mergeBackup(draftsRef.current,imported);
      Alert.alert('Restore invitations?',preview.added+' new invitation(s) can be added. '+preview.skipped+' existing ID(s) will stay unchanged. Photos are not embedded in JSON backups and may need to be selected again.',[
        {text:'Cancel',style:'cancel'},
        {text:'ADD INVITATIONS',onPress:async()=>{
          if(draftWriteInFlight.current)return;
          draftWriteInFlight.current=true;
          try{
            const current=draftsRef.current;
            const result=mergeBackup(current,imported);
            if(result.added===0){Alert.alert('No new invitations','All invitations from this file already exist locally.');return;}
            const saved=await writeLocalDrafts(AsyncStorage,current,result.drafts);
            draftsRef.current=result.drafts;
            setDrafts(result.drafts);
            Alert.alert('Invitations restored',result.added+' invitation(s) added. '+(!saved.backupSynced?'Local recovery mirror could not be refreshed; export another backup.':'Existing invitations were kept unchanged.'));
          }catch(e){
            if(e?.code==='RECOVERY_REQUIRED'){
              Alert.alert('Recovery copy protected','First restore missing local invitations using Saved → RECOVER FROM LOCAL COPY. The file import was not written.');
            }else{
              setStorageError(true);
              Alert.alert('Restore paused','The local list changed or storage is unavailable. No existing invitations were intentionally replaced. Retry loading drafts.');
            }
          }finally{draftWriteInFlight.current=false;}
        }}
      ]);
    }catch(e){Alert.alert('Invalid backup file','Choose a VivahSutra invitation backup JSON file. No local invitations were changed.');}
    finally{backupActionInFlight.current=false;setBackupBusy(false);}
  };
  const recoverLocalCopy=async()=>{
    if(!loaded||storageError||draftWriteInFlight.current||backupActionInFlight.current){
      Alert.alert('Recovery unavailable','Reload saved invitations and try again.');return;
    }
    backupActionInFlight.current=true;
    setBackupBusy(true);
    try{
      const snapshot=await inspectRecoverySnapshot(AsyncStorage,draftsRef.current);
      if(snapshot.added===0){
        Alert.alert('No missing invitations found',snapshot.snapshotCount===0?'This phone has no local recovery copy. Older versions did not create one.':'The local recovery copy contains no additional invitations.');
        return;
      }
      Alert.alert('Restore from local copy?',snapshot.added+' missing invitation(s) found. Restoring adds them without replacing your current drafts. Deleted drafts may also be included in this copy.',[
        {text:'Cancel',style:'cancel'},
        {text:'RESTORE MISSING',onPress:async()=>{
          if(draftWriteInFlight.current||backupActionInFlight.current)return;
          draftWriteInFlight.current=true;
          try{
            const previous=draftsRef.current;
            const fresh=await inspectRecoverySnapshot(AsyncStorage,previous);
            if(fresh.added===0){Alert.alert('No missing invitations','The recovery copy has no additional invitations now.');return;}
            const saved=await writeLocalDrafts(AsyncStorage,previous,fresh.drafts,{preserveRecoveredDrafts:true});
            draftsRef.current=fresh.drafts;
            setDrafts(fresh.drafts);
            Alert.alert('Recovery complete',fresh.added+' invitation(s) recovered. '+(saved.backupSynced?'Your current drafts were kept unchanged.':'Export a backup file; the local recovery copy was not refreshed.'));
          }catch(e){
            setStorageError(true);
            Alert.alert('Recovery paused','Could not safely write recovered invitations. Existing drafts were not intentionally replaced. Retry loading before further edits.');
          }finally{draftWriteInFlight.current=false;}
        }}
      ]);
    }catch(e){Alert.alert('Recovery copy unavailable','Could not read a usable local recovery copy. Current invitations were not changed.');}
    finally{backupActionInFlight.current=false;setBackupBusy(false);}
  };
  const choosePhoto=async(field)=>{
    try{
      const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:true,quality:.82,aspect:[1,1]});
      if(result.canceled||!result.assets?.[0]?.uri)return;
      const asset=result.assets[0]; const target=FileSystem.documentDirectory+'vivahsutra-'+nowId()+'.jpg';
      await FileSystem.copyAsync({from:asset.uri,to:target});
      editField(field,target);
    }catch(e){Alert.alert('Photo unavailable','Could not use this photo. Please try another image.');}
  };
  const capture=async(action)=>{
    if(!shot.current||exportInFlight.current)return;
    exportInFlight.current=true;
    setBusy(true);
    try{
      const result=await exportInvitationPng({
        action,
        capture:()=>shot.current.capture(),
        sharing:Sharing,
        mediaLibrary:MediaLibrary
      });
      if(result.status==='saved'){
        Alert.alert('Saved to photos','Your watermarked '+side+' invitation PNG is in your gallery.');
      }else if(result.status==='permission-denied'){
        Alert.alert('Gallery permission needed','Allow photo saving in Android settings, or use SHARE PNG to save via Files or another app.');
      }else if(result.status==='share-unavailable'){
        Alert.alert('Sharing unavailable','This device cannot open the Android share sheet.');
      }
    }catch(e){
      Alert.alert('PNG export failed','Could not capture, save or share the invitation PNG. Please check permissions and device storage.');
    }finally{
      exportInFlight.current=false;
      setBusy(false);
    }
  };
  const nav=(to)=>{
    if(to==='editor'){
      // Reopen unfinished work instead of forcing its discard.
      if(workingCandidate){resumeSavedWork();return;}
      if(tab!=='editor'&&hasUnsavedEdits){setTab('editor');return;}
      if(tab!=='editor')newInvite();
      return;
    }
    if(to===tab)return;
    const proceed=()=>{
      setTab(to);
      if(to==='designs'){setDesignFilter('All');setSelectedDesignId(null);}
    };
    if(tab==='editor'&&hasUnsavedEdits){
      Alert.alert('Unsaved invitation','Save your invitation before leaving. You can resume editing from Home or Create while the app remains open.',[
        {text:'Keep editing',style:'cancel'},
        {text:'Leave for now',onPress:proceed}
      ]);
      return;
    }
    proceed();
  };
  const tr=(en,hi)=>invite.language==='hi'?hi:en;
  const hindiOccasions={Wedding:'विवाह',Engagement:'सगाई',Haldi:'हल्दी',Mehendi:'मेहंदी',Sangeet:'संगीत',Reception:'स्वागत समारोह','Save the Date':'शुभ तिथि'};
  const categories=['All','Royal','Floral','Traditional','Modern'];
  const filtered=designFilter==='All'?DESIGNS:DESIGNS.filter(d=>d.category===designFilter);
  const Field=({title,field,placeholder,multiline=false})=><View style={{marginBottom:14}}><Text style={s.fieldLabel}>{title}</Text><TextInput accessibilityLabel={title} value={invite[field]||''} onChangeText={v=>editField(field,v)} placeholder={placeholder||title} placeholderTextColor="#817466" style={[s.field,multiline&&{height:91,textAlignVertical:'top'}]} multiline={multiline} maxLength={multiline?500:140} selectionColor={C.gold}/></View>;
  const Pill=({label,selected,onPress})=><Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{selected}} onPress={onPress} style={[s.pill,selected&&s.pillSelected]}><Text style={[s.pillText,selected&&{color:C.bg}]}>{label}</Text></Pressable>;
  const Header=()=> <View style={s.header}><View><Text style={s.brand}>❦  VivahSutra</Text><Small style={{letterSpacing:2.5,fontSize:8,color:C.gold,marginTop:4}}>THE ART OF INVITING · BETA V{BETA_VERSION}</Small></View><Pressable accessibilityRole="button" accessibilityLabel="Create new invitation" onPress={()=>newInvite()} style={s.headerAdd}><Text style={{fontSize:19,color:C.gold}}>＋</Text></Pressable></View>;
  const DesignTile=({design,grid=false})=><Pressable accessibilityRole="button" accessibilityLabel={(grid?'Select ':'Customise ')+design.name+' invitation'} accessibilityState={grid?{selected:selectedDesignId===design.id}:undefined} onPress={()=>grid?setSelectedDesignId(design.id):newInvite(design.id)} style={[s.tile,grid&&{flex:0,flexBasis:'auto',width:'100%',minHeight:245,flexDirection:'row',alignItems:'center'},grid&&selectedDesignId===design.id&&{borderColor:C.gold,borderWidth:2}]}>
    <View style={{alignItems:'center',paddingVertical:12,paddingLeft:12}}><InvitationCard data={{...NEW_INVITE,designId:design.id}} compact/></View>
    <View style={{padding:12,flex:1}}><Text style={{color:C.soft,fontFamily:'serif',fontSize:16,flexShrink:1}}>{design.name}</Text><Small style={{marginTop:4}}>{design.subtitle}</Small><Small style={{marginTop:8,color:C.gold}}>{design.category.toUpperCase()} DESIGN</Small><Text style={{color:C.gold,fontSize:11,fontWeight:'800',marginTop:12}}>{grid?(selectedDesignId===design.id?'✓  SELECTED':'○  TAP TO SELECT'):'TAP TO CUSTOMISE  ↗'}</Text></View>
  </Pressable>;
  const Home=()=> <View>
    {workingCandidate?<Section><Label>UNFINISHED INVITATION FOUND</Label>
      <Small>A local working copy from an earlier app session is available. Restore it to continue. Saved invitations will not be replaced.</Small>
      <GoldButton title="RESTORE UNFINISHED INVITATION" onPress={resumeSavedWork} style={{marginTop:12}}/>
      <Small style={{marginTop:8}}>To discard it, use Create New and approve the discard prompt.</Small>
    </Section>:null}
    {workingCopyError?<Section><Small style={{color:C.rose}}>Unfinished work storage needs review. Avoid clearing app data. Your saved invitation list is stored separately.</Small></Section>:null}
    {!workingCandidate&&hasUnsavedEdits?<Section><Label>UNSAVED INVITATION · जारी काम</Label>
      <Small>You have invitation changes that are not saved yet. Resume editing before starting a new card.</Small>
      <GoldButton title="RESUME EDITING   →" onPress={()=>setTab('editor')} style={{marginTop:12}}/>
    </Section>:null}
    <View style={s.homeWelcome}><Label>A CELEBRATION STARTS HERE</Label><Text style={s.bigTitle}>Your forever,{'\n'}<Text style={{color:C.gold,fontStyle:'italic'}}>beautifully invited.</Text></Text><Small style={{fontSize:13,lineHeight:21,marginTop:16}}>Create beautiful Indian wedding invitations with your story, your style and your loved ones.</Small><GoldButton title="CREATE MY INVITATION    ↗" onPress={()=>newInvite()} style={{marginTop:23,alignSelf:'flex-start'}}/></View>
    <View style={s.heroCard}><LinearGradient colors={['#493027','#291F1A']} style={{padding:21,borderRadius:20,overflow:'hidden'}}><Text style={{color:C.gold,fontSize:25}}>✦  ❦  ✦</Text><Text style={{fontFamily:'serif',fontSize:26,color:C.soft,marginTop:13}}>A royal beginning.</Text><Small style={{marginTop:7}}>Six signature collections. Endless beautiful moments.</Small><Pressable onPress={()=>nav('designs')} style={{marginTop:16}}><Text style={{color:C.gold,fontSize:12,fontWeight:'700'}}>EXPLORE DESIGNS  →</Text></Pressable></LinearGradient></View>
    <View style={s.rowHeading}><View><Label>THE SIGNATURE COLLECTION</Label><Text style={s.heading}>Find your style</Text></View><Pressable onPress={()=>nav('designs')}><Small style={{color:C.gold}}>View all  →</Small></Pressable></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginHorizontal:-18}} contentContainerStyle={{gap:12,paddingHorizontal:18,paddingBottom:12}}>
      {DESIGNS.slice(0,4).map(d=><View key={d.id} style={{width:193}}><DesignTile design={d}/></View>)}
    </ScrollView>
    <Section style={{marginTop:18}}><Label>APP UPDATES · BETA</Label>
      <Small>Installed: V{Application.nativeApplicationVersion||BETA_VERSION} · Android build {Application.nativeBuildVersion||'unknown'}</Small>
      <Small style={{marginTop:8}}>Updates are checked automatically when the app opens. Download and installation require your approval.</Small>
      {betaUpdate?<GoldButton title={'DOWNLOAD V'+betaUpdate.versionName+' UPDATE  ↗'} onPress={openBetaUpdate} style={{marginTop:13}}/>:null}
      <GoldButton title={updateStatus==='checking'?'CHECKING…':'CHECK FOR UPDATES'} disabled={updateStatus==='checking'} outline onPress={()=>checkUpdates(true)} style={{marginTop:10}}/>
      {updateStatus==='error'?<Small style={{color:C.rose,marginTop:8}}>Could not check for updates · Check your internet</Small>:null}
    </Section>
    <Section style={{marginTop:18}}><Label>HOW IT WORKS</Label>{[['01','Choose your design'],['02','Make the details yours'],['03','Save or share your invitation']].map(([n,t])=><View key={n} style={{flexDirection:'row',paddingVertical:10,alignItems:'center',gap:17}}><Text style={{color:C.gold,fontFamily:'serif',fontSize:19}}>{n}</Text><Text style={{color:C.soft,fontSize:13}}>{t}</Text></View>)}</Section>
  </View>;
  const DesignsScreen=()=> <View><FancyTitle top="THE COLLECTION" title="Six ways to say forever." subtitle="Tap a design to select it. Then choose Continue to customise your card."/>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginHorizontal:-18,marginBottom:16}} contentContainerStyle={{paddingHorizontal:18,gap:7}}>{categories.map(c=><Pill key={c} label={c} selected={designFilter===c} onPress={()=>{setDesignFilter(c);setSelectedDesignId(null);}}/>)}</ScrollView>
    <Small style={{marginBottom:12,color:C.gold}}>{filtered.length} of {DESIGNS.length} designs available · Tap a card to SELECT</Small><View style={s.grid}>{filtered.map(d=><DesignTile key={d.id} design={d} grid/>)}</View>{filtered.length===0?<Section><Small>No designs match this filter.</Small><GoldButton title="SHOW ALL DESIGNS" onPress={()=>setDesignFilter('All')}/></Section>:null}
  </View>;
  const Editor=()=> <View>
    <FancyTitle top="VIVAHSUTRA STUDIO" title={tr('Make it your own.','अपना निमंत्रण बनाएं')} subtitle={tr('Your details stay on this device until you choose to share.','जब तक आप साझा न करें, आपकी जानकारी इसी फ़ोन पर रहती है।')}/>
    <Section><Label>{tr('01  •  OCCASION','01  •  अवसर')}</Label><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:7}}>{OCCASIONS.map(o=><Pill key={o} label={tr(o,hindiOccasions[o]||o)} selected={invite.occasion===o} onPress={()=>editField('occasion',o)}/>)}</ScrollView><View style={{marginTop:15}}><Label>{tr('LANGUAGE','भाषा')}</Label><View style={{flexDirection:'row',gap:8}}>{[['en','English'],['hi','हिन्दी']].map(([id,label])=><Pill key={id} label={label} selected={invite.language===id} onPress={()=>switchLanguage(id)}/>)}</View></View></Section>
    <Section><Label>{tr('02  •  YOUR PEOPLE','02  •  परिवार')}</Label>{Field({title:tr("Bride's name",'दुल्हन का नाम'),field:"bride"})}{Field({title:tr("Groom's name",'दूल्हे का नाम'),field:"groom"})}{Field({title:tr("Host / family line",'आमंत्रित करने वाला परिवार'),field:"host"})}{Field({title:tr("Family names (back of card)",'परिवार के नाम (पीछे)'),field:"relatives",multiline:true})}</Section>
    <Section><Label>{tr('03  •  THE CELEBRATION','03  •  समारोह')}</Label>{Field({title:tr("Date","तारीख"),field:"date",placeholder:tr("18 February 2027","18 फ़रवरी 2027")})}{Field({title:tr("Time","समय"),field:"time",placeholder:tr("7:00 PM","शाम 7:00 बजे")})}{Field({title:tr("Venue","स्थान"),field:"venue"})}{Field({title:tr("RSVP / contact","संपर्क / RSVP"),field:"rsvp"})}{Field({title:tr("Personal message","शुभकामना संदेश"),field:"message",multiline:true})}</Section>
    <Section><Label>{tr('04  •  DESIGN','04  •  डिज़ाइन')}</Label><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:10,marginBottom:16}}>{DESIGNS.map(d=><Pressable key={d.id} accessibilityRole="radio" accessibilityState={{selected:invite.designId===d.id}} accessibilityLabel={'Select '+d.name} onPress={()=>editField('designId',d.id)} style={[s.designSelect,invite.designId===d.id&&{borderColor:C.gold,borderWidth:2}]}><View style={{width:23,height:23,borderRadius:8,backgroundColor:d.background[0],borderWidth:1,borderColor:d.line}}/><Text style={{color:C.soft,fontSize:11,marginLeft:7}}>{d.name}{invite.designId===d.id?'  ✓':''}</Text></Pressable>)}</ScrollView><Label>{tr('ACCENT COLOUR','रंग चुनें')}</Label><View style={{flexDirection:'row',gap:11,flexWrap:'wrap'}}>{ACCENTS.map(a=><Pressable accessibilityLabel={'Choose '+a.label} accessibilityRole="button" key={a.id} onPress={()=>editField('accent',a.id)} style={{height:35,width:35,borderRadius:18,backgroundColor:a.color,borderWidth:invite.accent===a.id?3:0,borderColor:C.soft}}/>)}</View></Section>
    <Section><Label>{tr('05  •  OPTIONAL PHOTOS','05  •  वैकल्पिक फ़ोटो')}</Label><View style={{flexDirection:'row',gap:9}}>{[['bridePhoto','BRIDE PHOTO'],['groomPhoto','GROOM PHOTO']].map(([field,title])=><View key={field} style={{flex:1}}><Pressable accessibilityRole="button" style={s.photoPick} onPress={()=>choosePhoto(field)}>{invite[field]?<Image source={{uri:invite[field]}} style={{width:62,height:62,borderRadius:31,marginBottom:8}}/>:<Text style={{fontSize:24,color:C.gold}}>＋</Text>}<Small style={{fontSize:9}}>{title}</Small></Pressable>{invite[field]?<Pressable onPress={()=>editField(field,null)}><Small style={{textAlign:'center',color:C.rose,marginTop:6}}>Remove</Small></Pressable>:null}</View>)}</View><Small style={{marginTop:11}}>Photos are stored on your phone. They are never uploaded.</Small></Section>
    <Section style={{alignItems:'center',paddingVertical:22}}><Label>{tr('LIVE INVITATION PREVIEW','निमंत्रण का लाइव प्रीव्यू')}</Label><View style={{flexDirection:'row',gap:8,marginBottom:14}}><Pill label={tr('Front','आगे')} selected={side==='front'} onPress={()=>setSide('front')}/><Pill label={tr('Back','पीछे')} selected={side==='back'} onPress={()=>setSide('back')}/></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{width:'100%'}} contentContainerStyle={{flexGrow:1,justifyContent:'center',alignItems:'center',paddingVertical:3}}>
        <ViewShot ref={shot} options={{format:'png',quality:1,result:'tmpfile'}}><InvitationCard data={invite} back={side==='back'}/></ViewShot>
      </ScrollView>
      <Small style={{marginTop:12,textAlign:'center'}}>Export saves the selected {side} side only · FREE BETA watermark included</Small>
      <View style={{flexDirection:'row',gap:9,marginTop:15,width:'100%'}}><GoldButton title={busy?'EXPORTING…':side==='front'?'SAVE FRONT PNG':'SAVE BACK PNG'} disabled={busy} onPress={()=>capture('save')} style={{flex:1}}/><GoldButton title="SHARE PNG" disabled={busy} onPress={()=>capture('share')} outline style={{flex:1}}/></View>
    </Section><GoldButton title={storageError?'STORAGE UNAVAILABLE':!loaded?tr('LOADING SAVED DRAFTS…','निमंत्रण लोड हो रहे हैं…'):saving?tr('SAVING…','सेव हो रहा है…'):invite.id?tr('UPDATE SAVED INVITATION','सेव किया निमंत्रण अपडेट करें'):tr('SAVE MY INVITATION','निमंत्रण सेव करें')} disabled={!loaded||saving||storageError} onPress={save} style={{marginBottom:18}}/><Small style={{textAlign:'center',marginBottom:20}}>Private local drafts · No payment or account required</Small>
  </View>;
  const Saved=()=> <View><FancyTitle top="YOUR CREATIONS" title="My invitations" subtitle="Saved on this device. Open any draft to edit or export."/>
    {storageError?<Section><Text style={{color:C.rose,fontSize:14,marginBottom:12}}>Cannot read saved invitations. Saving is paused to protect existing data.</Text><GoldButton title="RETRY LOADING DRAFTS" onPress={loadDrafts}/></Section>:null}
    {storageError?null:!loaded?<ActivityIndicator color={C.gold}/>:drafts.length===0?<Section style={{alignItems:'center',paddingVertical:37}}><Text style={{fontSize:45,color:C.gold,marginBottom:12}}>✦</Text><Text style={[s.heading,{fontSize:23,textAlign:'center'}]}>Your story starts here</Text><Small style={{textAlign:'center',marginVertical:14}}>Create your first invitation to see it here.</Small><GoldButton title="CREATE INVITATION" onPress={()=>newInvite()}/></Section>:drafts.map(d=><Section key={d.id} style={{flexDirection:'row',gap:13,alignItems:'center'}}><View style={{width:42,height:64,borderRadius:7,backgroundColor:DESIGNS.find(x=>x.id===d.designId)?.background[0]||C.panel2,borderColor:C.gold,borderWidth:1,alignItems:'center',justifyContent:'center'}}><Text style={{color:C.gold,fontSize:23}}>❦</Text></View><View style={{flex:1}}><Text style={{fontSize:15,color:C.soft,fontFamily:'serif'}} numberOfLines={1}>{d.bride} & {d.groom}</Text><Small>{DESIGNS.find(x=>x.id===d.designId)?.name||'Invitation'} · {d.occasion}</Small><View style={{flexDirection:'row',gap:18,marginTop:12}}><Pressable onPress={()=>editSaved(d)}><Text style={{color:C.gold,fontSize:12,fontWeight:'800'}}>OPEN / EDIT</Text></Pressable><Pressable onPress={()=>remove(d.id)}><Text style={{color:C.rose,fontSize:12,fontWeight:'800'}}>DELETE</Text></Pressable></View></View></Section>)}
    <Section style={{marginTop:15}}><Label>BACKUP & RESTORE · बैकअप</Label>
      <Small>Export a private JSON backup to Files or Drive before updating or changing phones. It contains names and invitation details; save it somewhere secure. Photos are not embedded.</Small>
      <GoldButton title={backupBusy?'WORKING…':'EXPORT BACKUP FILE'} disabled={backupBusy||!loaded||storageError||drafts.length===0} onPress={exportBackup} style={{marginTop:12}}/>
      <GoldButton title={backupBusy?'WORKING…':'RESTORE BACKUP FILE'} disabled={backupBusy||!loaded||storageError} outline onPress={importBackup} style={{marginTop:9}}/>
      <GoldButton title={backupBusy?'WORKING…':'RECOVER FROM LOCAL COPY'} disabled={backupBusy||!loaded||storageError} outline onPress={recoverLocalCopy} style={{marginTop:9}}/>
      <GoldButton title={storageChecking?'CHECKING…':'CHECK LOCAL STORAGE'} disabled={storageChecking||!loaded} outline onPress={checkLocalStorage} style={{marginTop:9}}/>
      {storageHealth?<View style={{marginTop:12}}>
        <Small>Device-only diagnostics · no names or invitation contents shown</Small>
        <Small>Saved list: {storageHealth.primary.status} · {storageHealth.primary.count==null?'?':storageHealth.primary.count} invitation(s)</Small>
        <Small>Recovery copy: {storageHealth.recovery.status} · {storageHealth.recovery.count==null?'?':storageHealth.recovery.count} invitation(s)</Small>
        <Small style={{color:storageHealth.missingFromPrimary>0?C.rose:C.muted}}>Missing IDs in recovery copy: {storageHealth.missingFromPrimary==null?'not available':storageHealth.missingFromPrimary}</Small>
        {storageHealth.missingFromPrimary>0?<Small style={{color:C.gold}}>Use RECOVER FROM LOCAL COPY and confirm before creating more invitations.</Small>:null}
      </View>:null}
      {drafts.length===0?<Small style={{marginTop:11,color:C.rose}}>No saved invitations found. You can check for an on-device recovery copy or import an exported JSON backup. Older builds may have no recovery copy; cleared or uninstalled data cannot be recreated automatically.</Small>:null}
    </Section>
    <Small style={{marginTop:10}}>These drafts are not synced to the website or to another device unless you export a backup yourself.</Small>
  </View>;
  const navItems=[['home','⌂','Home'],['designs','✧','Designs'],['editor','＋','Create'],['saved','▣','Saved']];
  return <View style={{flex:1,backgroundColor:C.bg}}><StatusBar barStyle="light-content"/>
    <SafeAreaView style={{flex:1}} edges={['top','left','right']}>
      <Header/>
      {betaUpdate?<Pressable accessibilityRole="button" accessibilityLabel="Download VivahSutra beta update" onPress={openBetaUpdate} style={{backgroundColor:C.panel2,borderBottomWidth:1,borderColor:C.gold,paddingVertical:12,paddingHorizontal:17}}>
        <Text style={{fontSize:12,fontWeight:'800',color:C.gold}}>NEW BETA AVAILABLE · V{betaUpdate.versionName} (build {betaUpdate.versionCode})  ↗</Text>
        <Small>Tap to download. Android will ask before installing.</Small>
      </Pressable>:null}
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
        <ScrollView key={tab} ref={listRef} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:18,paddingTop:26,paddingBottom:120}}>
          {tab==='home'?Home():tab==='designs'?DesignsScreen():tab==='editor'?Editor():Saved()}
        </ScrollView>
      </KeyboardAvoidingView>
      {tab==='designs'?<View style={{paddingHorizontal:18,paddingTop:11,paddingBottom:11,borderTopWidth:1,borderColor:C.line,backgroundColor:C.panel}}><Small style={{marginBottom:8,color:selectedDesignId?C.gold:C.muted}}>{selectedDesignId?'✓ Selected: '+(DESIGNS.find(d=>d.id===selectedDesignId)?.name||'Invitation'):'Select any design above to continue'}</Small><GoldButton title={selectedDesignId?'CONTINUE WITH SELECTED DESIGN   →':'SELECT A DESIGN FIRST'} disabled={!selectedDesignId} onPress={()=>selectedDesignId&&newInvite(selectedDesignId)}/></View>:null}
      <SafeAreaView edges={['bottom']} style={s.tabBar}><View style={{flexDirection:'row',justifyContent:'space-around'}}>{navItems.map(([id,symbol,label])=><Pressable key={id} accessibilityRole="tab" accessibilityState={{selected:tab===id}} onPress={()=>nav(id)} style={s.tabItem}><Text style={{color:tab===id?C.gold:C.muted,fontSize:24}}>{symbol}</Text><Text style={{color:tab===id?C.gold:C.muted,fontSize:10,marginTop:4,fontWeight:tab===id?'800':'500'}}>{label}</Text></Pressable>)}</View></SafeAreaView>
    </SafeAreaView>
    {intro?<RoyalDoorIntro onFinish={()=>setIntro(false)}/>:null}
  </View>;
}
export default function App(){return <SafeAreaProvider><AppContent/></SafeAreaProvider>;}
const s=StyleSheet.create({
  header:{height:66,borderBottomWidth:1,borderColor:C.line,paddingHorizontal:19,display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  brand:{fontFamily:'serif',fontSize:22,color:C.soft},headerAdd:{width:40,height:40,borderRadius:12,borderColor:C.line,borderWidth:1,alignItems:'center',justifyContent:'center'},
  heading:{fontFamily:'serif',fontSize:32,lineHeight:38,color:C.soft},bigTitle:{fontFamily:'serif',fontSize:42,lineHeight:48,color:C.soft},
  homeWelcome:{paddingHorizontal:4,paddingBottom:29},heroCard:{marginBottom:31},rowHeading:{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',marginBottom:15},
  tile:{backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:16,overflow:'hidden',flex:1},grid:{width:'100%',flexDirection:'column',gap:12},
  pill:{paddingHorizontal:14,paddingVertical:11,backgroundColor:C.panel,borderColor:C.line,borderWidth:1,borderRadius:24},pillSelected:{backgroundColor:C.gold,borderColor:C.gold},
  pillText:{color:C.soft,fontWeight:'700',fontSize:11},fieldLabel:{color:C.soft,fontSize:11,marginBottom:7,fontWeight:'600'},
  field:{backgroundColor:'#181512',borderColor:C.line,borderWidth:1,borderRadius:11,paddingHorizontal:13,paddingVertical:12,color:C.soft,fontSize:14},
  designSelect:{borderWidth:1,borderColor:C.line,borderRadius:12,padding:9,flexDirection:'row',alignItems:'center'},
  photoPick:{borderWidth:1,borderStyle:'dashed',borderColor:C.line,borderRadius:14,height:107,alignItems:'center',justifyContent:'center'},
  tabBar:{backgroundColor:'#201B17',borderTopWidth:1,borderColor:C.line},tabItem:{flex:1,alignItems:'center',justifyContent:'center',paddingVertical:10},
  introWrap:{position:'absolute',top:0,bottom:0,left:0,right:0,zIndex:9999,backgroundColor:'#1B1110',alignItems:'center',justifyContent:'center'},
  introLight:{position:'absolute',alignItems:'center',justifyContent:'center',top:0,bottom:0,left:0,right:0},
  door:{position:'absolute',top:0,bottom:0,width:'50%',borderColor:'#CDA86A',alignItems:'center',justifyContent:'center',overflow:'hidden'},
  doorOrnament:{height:'64%',width:'70%',borderColor:'#A77942',borderWidth:2,borderRadius:100,alignItems:'center',justifyContent:'space-evenly'},
  doorHandle:{width:15,height:42,borderRadius:10,position:'absolute',top:'49%',backgroundColor:'#D8B374',borderWidth:2,borderColor:'#8A6239'},
  introTitle:{position:'absolute',top:'18%',alignItems:'center'},introSkip:{position:'absolute',bottom:55,right:23,padding:14,borderRadius:30,backgroundColor:'rgba(0,0,0,.3)'},
});
