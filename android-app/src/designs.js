import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const ACCENTS = [
  { id:'gold', label:'Antique gold', color:'#CDA86A' },
  { id:'rose', label:'Rose', color:'#CF8E9A' },
  { id:'emerald', label:'Emerald', color:'#6A9B81' },
  { id:'peacock', label:'Peacock', color:'#6F9FAF' },
];

export const OCCASIONS = ['Wedding','Engagement','Haldi','Mehendi','Sangeet','Reception','Save the Date'];

export const DESIGNS = [
  {id:'rajwada',name:'Rajwada Royale',subtitle:'A royal beginning',category:'Royal',background:['#301B27','#5B2A38'],ink:'#FFF4DC',line:'#D8B678',motif:'✦',dark:true},
  {id:'garden',name:'Garden of Love',subtitle:'Soft, blooming romance',category:'Floral',background:['#FFF6ED','#F4DEDC'],ink:'#68404B',line:'#CC9297',motif:'❀',dark:false},
  {id:'heirloom',name:'Modern Heirloom',subtitle:'Timeless minimal',category:'Modern',background:['#FBF8EF','#F1EADD'],ink:'#392D27',line:'#AA9475',motif:'◇',dark:false},
  {id:'mangal',name:'Mangal Patrika',subtitle:'Tradition with soul',category:'Traditional',background:['#8B2F36','#AE5140'],ink:'#FFF2CD',line:'#F0BF70',motif:'ॐ',dark:true},
  {id:'mughal',name:'Mughal Garden',subtitle:'Ornamental grandeur',category:'Royal',background:['#173C35','#346355'],ink:'#F4E9D0',line:'#D1B175',motif:'❧',dark:true},
  {id:'pastel',name:'Pastel Bloom',subtitle:'Contemporary and dreamy',category:'Floral',background:['#F9E7EB','#F7F3F1'],ink:'#724E65',line:'#CEADBF',motif:'✿',dark:false},
];

export const NEW_INVITE = {
  id:null, designId:'rajwada', accent:'gold', language:'en', occasion:'Wedding',
  bride:'Meera', groom:'Aarav', host:'Together with their families',
  relatives:'', date:'18 February 2027', time:'7:00 PM', venue:'Jaipur, Rajasthan',
  rsvp:'', message:'Your presence will make our celebration even more beautiful.',
  bridePhoto:null, groomPhoto:null, createdAt:null, updatedAt:null
};

const typography = StyleSheet.create({
  serif:{fontFamily:'serif'},tiny:{fontSize:9,letterSpacing:2,fontWeight:'700'},
  name:{fontFamily:'serif',fontSize:37,textAlign:'center',fontWeight:'400',lineHeight:46},
});

export function InvitationCard({data=NEW_INVITE, compact=false, back=false, watermarked=true}) {
  const design=DESIGNS.find(x=>x.id===data.designId)||DESIGNS[0];
  const accent=ACCENTS.find(x=>x.id===data.accent)?.color||design.line;
  const factor=compact?0.58:1;
  const ink=design.ink;
  const h=compact?221:440, w=compact?148:300;
  const sidePadding=compact?8:24;
  const names=String(data.bride||'Bride')+'  &  '+String(data.groom||'Groom');
  const isHindi=data.language==='hi';
  const mark=isHindi?'शुभ विवाह':(data.occasion||'Wedding').toUpperCase();
  const Thin=({children,style})=><Text style={[{color:ink,textAlign:'center',fontSize:10*factor,letterSpacing:1.15},style]} numberOfLines={compact?2:4}>{children}</Text>;
  return (
    <LinearGradient colors={design.background} style={{width:w,height:h,padding:compact?8:12,borderRadius:compact?8:16,overflow:'hidden'}}>
      <View style={{flex:1,borderWidth:1.2,borderColor:accent,paddingHorizontal:sidePadding,paddingTop:compact?11:19,paddingBottom:compact?9:14,alignItems:'center',justifyContent:'space-between'}}>
        <View style={{alignItems:'center',width:'100%'}}>
          <Text style={{color:accent,fontSize:compact?17:25,textAlign:'center'}}>{design.motif}   ✦   {design.motif}</Text>
          <Thin style={{marginTop:compact?3:7,letterSpacing:compact?1:2}}>{back?'WITH LOVE & BLESSINGS':mark}</Thin>
          <View style={{height:1,width:'30%',backgroundColor:accent,marginTop:compact?6:13,opacity:.7}} />
        </View>
        {back?(
          <View style={{alignItems:'center',width:'100%',gap:10*factor}}>
            <Text style={{color:ink,fontFamily:'serif',fontSize:28*factor,textAlign:'center'}}>Our Families</Text>
            <Thin style={{fontSize:13*factor,lineHeight:21*factor}}>{data.relatives?.trim()||data.host||'With love from our families'}</Thin>
            <Text style={{color:accent,fontSize:23*factor}}>❦</Text>
            <Thin>{data.rsvp?.trim()?('RSVP  •  '+data.rsvp):'WE CAN’T WAIT TO CELEBRATE WITH YOU'}</Thin>
          </View>
        ):(
          <View style={{alignItems:'center',width:'100%',flexShrink:1}}>
            <Thin style={{marginBottom:compact?6:10}}>{data.host||'TOGETHER WITH THEIR FAMILIES'}</Thin>
            {(data.bridePhoto||data.groomPhoto)&&(
              <View style={{flexDirection:'row',gap:6,marginBottom:compact?5:9}}>
                {[data.bridePhoto,data.groomPhoto].filter(Boolean).map((uri,i)=><Image key={i} source={{uri}} style={{width:compact?30:54,height:compact?30:54,borderRadius:50,borderWidth:1.5,borderColor:accent}} />)}
              </View>
            )}
            <Text numberOfLines={2} adjustsFontSizeToFit minimumFontScale={.65} style={[typography.name,{fontSize:compact?21:37,lineHeight:compact?27:46,color:ink,marginBottom:compact?2:6}]}>{names}</Text>
            <Text style={{color:accent,fontSize:compact?12:22,marginBottom:compact?3:6}}>✦ ── ❧ ── ✦</Text>
            <Thin style={{letterSpacing:compact?.6:1}}>{data.message?.trim()||'JOIN US TO CELEBRATE'}</Thin>
          </View>
        )}
        <View style={{alignItems:'center',width:'100%'}}>
          {!back&&<>
            <Text numberOfLines={2} style={{color:ink,fontFamily:'serif',fontSize:compact?12:18,textAlign:'center'}}>{data.date||'Wedding date'}</Text>
            <Thin style={{marginTop:compact?2:5}}>{data.time||'Time'}</Thin>
            <Thin style={{marginTop:compact?3:8}}>{data.venue||'Venue'}</Thin>
          </>}
          <View style={{height:1,width:'42%',backgroundColor:accent,marginTop:compact?5:11,marginBottom:compact?3:8,opacity:.7}} />
          <Thin style={{letterSpacing:compact?1:2}}>{isHindi?'॥ मंगलमय शुभकामनाएं ॥':'THE ART OF INVITING'}</Thin>
          {watermarked&&<Text style={{position:'absolute',bottom:compact?-8:-11,right:compact?-8:-12,fontWeight:'800',fontSize:compact?6:9,letterSpacing:.5,color:ink,opacity:.48}}>FREE BETA</Text>}
        </View>
      </View>
    </LinearGradient>
  );
}
