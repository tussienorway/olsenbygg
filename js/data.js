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
 {t:"Nybygg",d:"Prosjektering og bygging av eneboliger og mindre leilighetsbygg.",k:"privat"},
 {t:"Tilbygg og påbygg",d:"Mer plass på eksisterende bolig – fra tegning til ferdig bygg.",k:"privat"},
 {t:"Restaurering og rehabilitering",d:"Oppgradering av eldre bygg.",k:"privat"},
 {t:"Etterisolering av murbygg",d:"Lavere energibruk i eldre murhus.",k:"naering"},
 {t:"Arkitekttjenester",d:"Tegninger i 1:50 og salgstegninger.",k:"naering"},
 {t:"Søknader og byggemelding",d:"Vi tar papirarbeidet mot kommunen.",k:"offentlig"},
 {t:"Interiørveiledning",d:"Hjelp med valg av farger, materialer og løsninger.",k:"privat"}
];
/* Priser i verktøyene er GROVE EKSEMPELTALL for estimat – ikke Olsenbyggs priser. */
window.MATERIALER={
 belegningsstein:{navn:"Belegningsstein",enhet:"m²",pr:1,svinn:.08,pris:650,tekstur:"stein",farge:"#8d8f93"},
 skifer:{navn:"Skiferheller",enhet:"m²",pr:1,svinn:.12,pris:900,tekstur:"skifer",farge:"#4b5560"},
 grus:{navn:"Grus/pukk (0,1 m lag)",enhet:"m³",pr:.1,svinn:.1,pris:450,tekstur:"grus",farge:"#b3a58c"},
 plen:{navn:"Ferdigplen",enhet:"m²",pr:1,svinn:.05,pris:110,tekstur:"plen",farge:"#4f8a2f"},
 terrasse:{navn:"Terrassebord (tre)",enhet:"lm",pr:8.3,svinn:.1,pris:45,tekstur:"tre",farge:"#a8743f"},
 kompositt:{navn:"Komposittbord",enhet:"lm",pr:7.2,svinn:.08,pris:120,tekstur:"kompositt",farge:"#5d5550"},
 betong:{navn:"Betongheller",enhet:"m²",pr:1,svinn:.06,pris:380,tekstur:"heller",farge:"#a7a8a3"},
 hekk:{navn:"Hekkplanter",enhet:"stk",pr:3,svinn:.05,pris:120,tekstur:"hekk",farge:"#2e5d22",lopende:true},
 stottemur:{navn:"Støttemur (blokk)",enhet:"stk",pr:8,svinn:.05,pris:85,tekstur:"mur",farge:"#9a9a95",lopende:true},
 kantstein:{navn:"Kantstein",enhet:"stk",pr:1,svinn:.05,pris:95,tekstur:"kant",farge:"#c9c9c4",lopende:true},
 gjerde:{navn:"Tregjerde",enhet:"lm",pr:1,svinn:.05,pris:600,tekstur:"gjerde",farge:"#c8b08a",lopende:true}
};
