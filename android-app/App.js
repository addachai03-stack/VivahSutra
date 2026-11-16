import React, {useEffect,useRef,useState} from 'react';
import {ActivityIndicator, Alert, Animated, BackHandler, Easing, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as FileSystem from 'expo-file-system/legacy';
import ViewShot from 'react-native-view-shot';
import {ACCENTS, DESIGNS, InvitationCard, NEW_INVITE, OCCASIONS} from './src/designs';

const C={bg:'#171310',panel:'#24201C',panel2:'#30271F',gold:'#D6B174',soft:'#F9EDDB',muted:'#AEA194',line:'#4D4033',rose:'#C9928B'};
const KEY='vivahsutra-native-drafts-v1';
const nowId=()=>String(Date.now())+'-'+Math.random().toString(36).slice(2,7);
const makeNew=(designId='rajwada')=>({...NEW_INVITE,id:null,designId});
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
  const moveLeft=left.interpolate({inputRange:[0,1],outputRange:['0%','-96%']});
  const moveRight=right.interpolate({inputRange:[0,1],outputRange:['0%','96%']});
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
  const [invite,setInvite]=useState(makeNew());
  const [side,setSide]=useState('front');
  const [drafts,setDrafts]=useState([]);
  const [loaded,setLoaded]=useState(false);
  const [busy,setBusy]=useState(false);
  const shot=useRef(null);
  const listRef=useRef(null);
  useEffect(()=>{(async()=>{
    try{const value=await AsyncStorage.getItem(KEY);if(value){const parsed=JSON.parse(value);if(Array.isArray(parsed))setDrafts(parsed);}}
    catch(e){Alert.alert('Storage notice','Could not load saved invitations. Nothing has been deleted.');}
    finally{setLoaded(true);}
  })();},[]);
  useEffect(()=>{const subscription=BackHandler.addEventListener('hardwareBackPress',()=>{if(intro){setIntro(false);return true;}if(tab!=='home'){setTab('home');return true;}return false;});return()=>subscription.remove();},[tab,intro]);
  const editField=(field,value)=>setInvite(p=>({...p,[field]:value}));
  const newInvite=(designId='rajwada')=>{setInvite(makeNew(designId));setSide('front');setTab('editor');};
  const editSaved=(data)=>{setInvite({...makeNew(),...data});setSide('front');setTab('editor');};
  const save=async()=>{
    if(!invite.bride?.trim()||!invite.groom?.trim()){Alert.alert('Names required','Add both names before saving your invitation.');return;}
    const id=invite.id||nowId();
    const entry={...invite,id,createdAt:invite.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
    const next=[entry,...drafts.filter(d=>d.id!==id)];
    try{await AsyncStorage.setItem(KEY,JSON.stringify(next));setDrafts(next);setInvite(entry);Alert.alert('Invitation saved','Your draft is saved privately on this device.');}
    catch(e){Alert.alert('Could not save','Please check your device storage and try again.');}
  };
  const remove=(id)=>Alert.alert('Delete invitation?','This deletes this local draft and cannot be undone.',[
    {text:'Cancel',style:'cancelled'},
    {text:'Delete',style:'destructive',onPress:async()=>{
      const next=drafts.filter(x=>x.id!==id);
      try{await AsyncStorage.setItem(KEY,JSON.stringify(next));setDrafts(next);}
      catch(e){Alert.alert('Delete failed','The saved invitation was not changed.');}
    }}
  ]);
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
    if(!shot.current||busy)return;
    setBusy(true);
    try{
      const uri=await shot.current.capture();
      if(action==='share'){
        if(!await Sharing.isAvailableAsync()){Alert.alert('Sharing unavailable','This device cannot share files from the app.');return;}
        await Sharing.shareAsync(uri,{mimeType:'image/png',dialogTitle:'Share your VivahSutra invitation'});
      }else{
        const permission=await MediaLibrary.requestPermissionsAsync(true,['photo']);
        if(!permission.granted){Alert.alert('Permission needed','Allow saving photos to download the invitation PNG.');return;}
        await MediaLibrary.createAssetAsync(uri);
        Alert.alert('Saved to photos','Your watermarked invitation PNG is in your gallery.');
      }
    }catch(e){Alert.alert('Export failed','Could not create the PNG. Please try again.');}
    finally{setBusy(false);}
  };
  const nav=(to)=>{setTab(to);if(to==='editor')setSide('front');};
  const categories=['All','Royal','Floral','Traditional','Modern'];
  const filtered=designFilter==='All'?DESIGNS:DESIGNS.filter(d=>d.category===designFilter);
  const Field=({title,field,placeholder,multiline=false})=><View style={{marginBottom:14}}><Text style={s.fieldLabel}>{title}</Text><TextInput value={invite[field]||''} onChangeText={v=>editField(field,v)} placeholder={placeholder||title} placeholderTextColor="#817466" style={[s.field,multiline&&{height:91,textAlignVertical:'top'}]} multiline={multiline} maxLength={multiline?500:140} selectionColor={C.gold}/></View>;
  const Pill=({label,selected,onPress})=><Pressable accessibilityRole="button" onPress={onPress} style={[s.pill,selected&&s.pillSelected]}><Text style={[s.pillText,selected&&{color:C.bg}]}>{label}</Text></Pressable>;
  const Header=()=> <View style={s.header}><View><Text style={s.brand}>❦  VivahSutra</Text><Small style={{letterSpacing:2.5,fontSize:8,color:C.gold,marginTop:4}}>THE ART OF INVITING</Small></View><Pressable accessibilityRole="button" onPress={()=>newInvite()} style={s.headerAdd}><Text style={{fontSize:19,color:C.gold}}>＋</Text></Pressable></View>;
  const DesignTile=({design})=><Pressable accessibilityRole="button" onPress={()=>newInvite(design.id)} style={s.tile}>
    <View style={{alignItems:'center',paddingTop:12,paddingBottom:4}}><InvitationCard data={{...NEW_INVITE,designId:design.id}} compact/></View>
    <View style={{padding:12}}><Text style={{color:C.soft,fontFamily:'serif',fontSize:16}}>{design.name}</Text><Small style={{marginTop:4}}>{design.subtitle}</Small><Text style={{color:C.gold,fontSize:10,fontWeight:'800',marginTop:12}}>CUSTOMISE  ↗</Text></View>
  </Pressable>;
  const Home=()=> <View>
    <View style={s.homeWelcome}><Label>A CELEBRATION STARTS HERE</Label><Text style={s.bigTitle}>Your forever,{'\n'}<Text style={{color:C.gold,fontStyle:'italic'}}>beautifully invited.</Text></Text><Small style={{fontSize:13,lineHeight:21,marginTop:16}}>Create beautiful Indian wedding invitations with your story, your style and your loved ones.</Small><GoldButton title="CREATE MY INVITATION    ↗" onPress={()=>newInvite()} style={{marginTop:23,alignSelf:'flex-start'}}/></View>
    <View style={s.heroCard}><LinearGradient colors={['#493027','#291F1A']} style={{padding:21,borderRadius:20,overflow:'hidden'}}><Text style={{color:C.gold,fontSize:25}}>✦  ❦  ✦</Text><Text style={{fontFamily:'serif',fontSize:26,color:C.soft,marginTop:13}}>A royal beginning.</Text><Small style={{marginTop:7}}>Six signature collections. Endless beautiful moments.</Small><Pressable onPress={()=>nav('designs')} style={{marginTop:16}}><Text style={{color:C.gold,fontSize:12,fontWeight:'700'}}>EXPLORE DESIGNS  →</Text></Pressable></LinearGradient></View>
    <View style={s.rowHeading}><View><Label>THE SIGNATURE COLLECTION</Label><Text style={s.heading}>Find your style</Text></View><Pressable onPress={()=>nav('designs')}><Small style={{color:C.gold}}>View all  →</Small></Pressable></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginHorizontal:-18}} contentContainerStyle={{gap:12,paddingHorizontal:18,paddingBottom:12}}>
      {DESIGNS.slice(0,4).map(d=><View key={d.id} style={{width:193}}><DesignTile design={d}/></View>)}
    </ScrollView>
    <Section style={{marginTop:18}}><Label>HOW IT WORKS</Label>{[['01','Choose your design'],['02','Make the details yours'],['03','Save or share your invitation']].map(([n,t])=><View key={n} style={{flexDirection:'row',paddingVertical:10,alignItems:'center',gap:17}}><Text style={{color:C.gold,fontFamily:'serif',fontSize:19}}>{n}</Text><Text style={{color:C.soft,fontSize:13}}>{t}</Text></View>)}</Section>
  </View>;
  const DesignsScreen=()=> <View><FancyTitle top="THE COLLECTION" title="Six ways to say forever." subtitle="Every invitation starts with a carefully crafted design. Choose one to personalise."/ >
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginHorizontal:-18,marginBottom:16}} contentContainerStyle={{paddingHorizontal:18,gap:7}}>{categories.map(c=><Pill key={c} label={c} selected={designFilter===c} onPress={()=>setDesignFilter(c)}/>)}</ScrollView>
    <View style={s.grid}>{filtered.map(d=><DesignTile key={d.id} design={d}/>)}</View>
  </View>;
  const Editor=()=> <View>
    <FancyTitle top="VIVAHSUTRA STUDIO" title="Make it your own." subtitle="Your details stay on this device until you choose to share."/>
    <Section><Label>01  •  OCCASION</Label><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:7}}>{OCCASIONS.map(o=><Pill key={o} label={o} selected={invite.occasion===o} onPress={()=>editField('occasion',o)}/>)}</ScrollView><View style={{marginTop:15}}><Label>LANGUAGE</Label><View style={{flexDirection:'row',gap:8}}>{[['en','English'],['hi','हिन्दी']].map(([id,label])=><Pill key={id} label={label} selected={invite.language===id} onPress={()=>editField('language',id)}/>)}</View></View></Section>
    <Section><Label>02  •  YOUR PEOPLE</Label><Field title="Bride's name" field="bride"/><Field title="Groom's name" field="groom"/><Field title="Host / family line" field="host"/><Field title="Family names (back of card)" field="relatives" multiline/></Section>
    <Section><Label>03  •  THE CELEBRATION</Label><Field title="Date" field="date" placeholder="18 February 2027"/><Field title="Time" field="time" placeholder="7:00 PM"/><Field title="Venue" field="venue"/><Field title="RSVP / contact" field="rsvp"/><Field title="Personal message" field="message" multiline/></Section>
    <Section><Label>04  •  DESIGN</Label><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:10,marginBottom:16}}>{DESIGNS.map(d=><Pressable key={d.id} onPress={()=>editField('designId',d.id)} style={[s.designSelect,invite.designId===d.id&&{borderColor:C.gold}]}><View style={{width:23,height:23,borderRadius:8,backgroundColor:d.background[0],borderWidth:1,borderColor:d.line}}/><Text style={{color:C.soft,fontSize:11,marginLeft:7}}>{d.name}</Text></Pressable>)}</ScrollView><Label>ACCENT COLOUR</Label><View style={{flexDirection:'row',gap:11,flexWrap:'wrap'}}>{ACCENTS.map(a=><Pressable accessibilityLabel={'Choose '+a.label} accessibilityRole="button" key={a.id} onPress={()=>editField('accent',a.id)} style={{height:35,width:35,borderRadius:18,backgroundColor:a.color,borderWidth:invite.accent===a.id?3:0,borderColor:C.soft}}/>)}</View></Section>
    <Section><Label>05  •  OPTIONAL PHOTOS</Label><View style={{flexDirection:'row',gap:9}}>{[['bridePhoto','BRIDE PHOTO'],['groomPhoto','GROOM PHOTO']].map(([field,title])=><View key={field} style={{flex:1}}><Pressable accessibilityRole="button" style={s.photoPick} onPress={()=>choosePhoto(field)}>{invite[field]?<Image source={{uri:invite[field]}} style={{width:62,height:62,borderRadius:31,marginBottom:8}}/>:<Text style={{fontSize:24,color:C.gold}}>＋</Text>}<Small style={{fontSize:9}}>{title}</Small></Pressable>{invite[field]?<Pressable onPress={()=>editField(field,null)}><Small style={{textAlign:'center',color:C.rose,marginTop:6}}>Remove</Small></Pressable>:null}</View>)}</View><Small style={{marginTop:11}}>Photos are stored on your phone. They are never uploaded.</Small></Section>
    <Section style={{alignItems:'center',paddingVertical:22}}><Label>LIVE INVITATION PREVIEW</Label><View style={{flexDirection:'row',gap:8,marginBottom:14}}><Pill label="Front" selected={side==='front'} onPress={()=>setSide('front')}/><Pill label="Back" selected={side==='back'} onPress={()=>setSide('back')}/></View>
      <ViewShot ref={shot} options={{format:'png',quality:1,result:'tmpfile'}}><InvitationCard data={invite} back={side==='back'}/></ViewShot>
      <Small style={{marginTop:12}}>FREE BETA watermark included in exports</Small>
      <View style={{flexDirection:'row',gap:9,marginTop:15,width:'100%'}}><GoldButton title={busy?'EXPORTING…':'SAVE PNG'} disabled={busy} onPress={()=>capture('save')} style={{flex:1}}/><GoldButton title="SHARE PNG" disabled={busy} onPress={()=>capture('share')} outline style={{flex:1}}/></View>
    </Section><GoldButton title={invite.id?'UPDATE SAVED INVITATION':'SAVE MY INVITATION'} onPress={save} style={{marginBottom:18}}/><Small style={{textAlign:'center',marginBottom:20}}>Private local drafts · No payment or account required</Small>
  </View>;
  const Saved=()=> <View><FancyTitle top="YOUR CREATIONS" title="My invitations" subtitle="Saved on this device. Open any draft to edit or export."/>
    {!loaded?<ActivityIndicator color={C.gold}/>:drafts.length===0?<Section style={{alignItems:'center',paddingVertical:37}}><Text style={{fontSize:45,color:C.gold,marginBottom:12}}>✦</Text><Text style={[s.heading,{fontSize:23,textAlign:'center'}]}>Your story starts here</Text><Small style={{textAlign:'center',marginVertical:14}}>Create your first invitation to see it here.</Small><GoldButton title="CREATE INVITATION" onPress={()=>newInvite()}/></Section>:drafts.map(d=><Section key={d.id} style={{flexDirection:'row',gap:13,alignItems:'center'}}><View style={{width:42,height:64,borderRadius:7,backgroundColor:DESIGNS.find(x=>x.id===d.designId)?.background[0]||C.panel2,borderColor:C.gold,borderWidth:1,alignItems:'center',justifyContent:'center'}}><Text style={{color:C.gold,fontSize:23}}>❦</Text></View><View style={{flex:1}}><Text style={{fontSize:15,color:C.soft,fontFamily:'serif'}} numberOfLines={1}>{d.bride} & {d.groom}</Text><Small>{DESIGNS.find(x=>x.id===d.designId)?.name||'Invitation'} · {d.occasion}</Small><View style={{flexDirection:'row',gap:18,marginTop:12}}><Pressable onPress={()=>editSaved(d)}><Text style={{color:C.gold,fontSize:12,fontWeight:'800'}}>OPEN / EDIT</Text></Pressable><Pressable onPress={()=>remove(d.id)}><Text style={{color:C.rose,fontSize:12,fontWeight:'800'}}>DELETE</Text></Pressable></View></View></Section>)}
    <Small style={{marginTop:15}}>These drafts are not synced to the website or to another device.</Small>
  </View>;
  const navItems=[['home','⌂','Home'],['designs','✧','Designs'],['editor','＋','Create'],['saved','▣','Saved']];
  return <View style={{flex:1,backgroundColor:C.bg}}><StatusBar barStyle="light-content" backgroundColor={C.bg}/>
    <SafeAreaView style={{flex:1}} edges={['top','left','right']}>
      <Header/>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
        <ScrollView key={tab} ref={listRef} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:18,paddingTop:26,paddingBottom:120}}>
          {tab==='home'?<Home/>:tab==='designs'?<DesignsScreen/>:tab==='editor'?<Editor/>:<Saved/>}
        </ScrollView>
      </KeyboardAvoidingView>
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
  tile:{backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:16,overflow:'hidden',flex:1},grid:{flexDirection:'row',flexWrap:'wrap',gap:12},
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
