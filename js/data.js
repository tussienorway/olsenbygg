/* Fakta om Olsenbygg Grimstad AS. Kun verifiserbare opplysninger. Hentet 02.11.2026. */
window.FIRMA={
  navn:"Olsenbygg Grimstad AS",
  adresse:"Industriveien 15, 4879 Grimstad",          // kilde: Brønnøysundregistrene
  tlf:"415 15 588", tlfRaw:"+4741515588",              // kilde: olsenbygg.com
  epost:"rolf@olsenbygg.com",                          // kilde: olsenbygg.com
  nett:"https://www.olsenbygg.com",
  geo:[58.316239,8.558973],                            // kilde: tredjeparts stedsoppføring (UVERIFISERT)
  apent:{1:[7,15],2:[7,15],3:[7,15],4:[7,15],5:[7,15]},// kilde: tredjeparts stedsoppføring (UVERIFISERT)
  etablert:2004, ansatte:20,                           // kilde: Proff.no (UVERIFISERT mot årsregnskap)
  kilder:["https://www.brreg.no","https://www.olsenbygg.com","https://www.proff.no"]
};
window.TJENESTER=[
  {t:"Nybygg",d:"Prosjektering og bygging av eneboliger, fritidsboliger og mindre leilighetsbygg på Sørlandet.",k:"privat",ico:"🏠",kat:"Privat · Bolig"},
  {t:"Tilbygg og påbygg",d:"Mer plass på eksisterende bolig – fra første skisse og tegning til ferdig godkjent bygg.",k:"privat",ico:"📐",kat:"Privat · Utvidelse"},
  {t:"Restaurering og rehabilitering",d:"Fagmessig oppgradering, fasadeendring, tak, vinduer og totalrenovering av eldre bygg.",k:"privat",ico:"🔨",kat:"Privat & Næring"},
  {t:"Etterisolering av murbygg",d:"Spesialkompetanse på utvendig og innvendig etterisolering som gir lavere energibruk i eldre murhus.",k:"naering",ico:"🧱",kat:"Næring & Borettslag"},
  {t:"Arkitekttjenester",d:"Tegninger i målestokk 1:50, situasjonsplan, snitt, fasader og salgstegninger under samme tak.",k:"naering",ico:"✏️",kat:"Arkitekt · 1:50"},
  {t:"Søknader og byggemelding",d:"Vi håndterer hele papirarbeidet, nabovarsel, dispensasjoner og ansvarlig søker mot kommunen.",k:"offentlig",ico:"📋",kat:"Offentlig & Privat"},
  {t:"Interiørveiledning",d:"Faglig hjelp med romløsninger, valg av farger, overflater, belysning og varige materialer.",k:"privat",ico:"🎨",kat:"Rådgivning"}
];
/* Priser i verktøyene er GROVE EKSEMPELTALL for estimat – ikke Olsenbyggs priser. */
window.MATERIALER={
  belegningsstein:{navn:"Belegningsstein",enhet:"m²",pr:1,svinn:.08,pris:650,tekstur:"stein",farge:"#8d8f93",kat:"Dekke"},
  skifer:{navn:"Skiferheller",enhet:"m²",pr:1,svinn:.12,pris:900,tekstur:"skifer",farge:"#4b5560",kat:"Dekke"},
  grus:{navn:"Grus/pukk (0,1 m lag)",enhet:"m³",pr:.1,svinn:.1,pris:450,tekstur:"grus",farge:"#b3a58c",kat:"Dekke"},
  plen:{navn:"Ferdigplen",enhet:"m²",pr:1,svinn:.05,pris:110,tekstur:"plen",farge:"#4f8a2f",kat:"Grønt"},
  terrasse:{navn:"Terrassebord (tre)",enhet:"lm",pr:8.3,svinn:.1,pris:45,tekstur:"tre",farge:"#a8743f",kat:"Terrasse"},
  kompositt:{navn:"Komposittbord",enhet:"lm",pr:7.2,svinn:.08,pris:120,tekstur:"kompositt",farge:"#5d5550",kat:"Terrasse"},
  betong:{navn:"Betongheller",enhet:"m²",pr:1,svinn:.06,pris:380,tekstur:"heller",farge:"#a7a8a3",kat:"Dekke"},
  hekk:{navn:"Hekkplanter",enhet:"stk",pr:3,svinn:.05,pris:120,tekstur:"hekk",farge:"#2e5d22",lopende:true,kat:"Grønt"},
  stottemur:{navn:"Støttemur (blokk)",enhet:"stk",pr:8,svinn:.05,pris:85,tekstur:"mur",farge:"#9a9a95",lopende:true,kat:"Mur & kant"},
  kantstein:{navn:"Kantstein",enhet:"stk",pr:1,svinn:.05,pris:95,tekstur:"kant",farge:"#c9c9c4",lopende:true,kat:"Mur & kant"},
  gjerde:{navn:"Tregjerde",enhet:"lm",pr:1,svinn:.05,pris:600,tekstur:"gjerde",farge:"#c8b08a",lopende:true,kat:"Inngjerding"}
};
