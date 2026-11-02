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
 belegningsstein:{navn:"Belegningsstein",enhet:"m²",pr:1,svinn:.08,pris:650,tekstur:"stein"},
 hekk:{navn:"Hekkplanter",enhet:"stk",pr:3,svinn:.05,pris:120,tekstur:"hekk",lopende:true},
 terrasse:{navn:"Terrassebord",enhet:"lm",pr:8.3,svinn:.1,pris:45,tekstur:"tre"},
 plen:{navn:"Ferdigplen",enhet:"m²",pr:1,svinn:.05,pris:110,tekstur:"plen"},
 stottemur:{navn:"Støttemur (blokk)",enhet:"stk",pr:8,svinn:.05,pris:85,tekstur:"mur",lopende:true}
};
