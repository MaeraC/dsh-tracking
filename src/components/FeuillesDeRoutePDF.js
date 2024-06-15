//import React from 'react';
//import { Document, Page, Text, View, Image } from '@react-pdf/renderer';


 /*
const FeuillesDeRoutePDF = ({ filteredFeuilles }) => (
    <Document>
   
    {filteredFeuilles.map(feuille => (
        <Page key={feuille.id} className="this-week">  
            <Text style={{textAlign: "center"}}>Semaine du {feuille.dateSignature}</Text>
            <View className="dayOn-section">
                {feuille.dayOn && feuille.dayOn.length > 0 && (
                    <View className='feuille-jj'>
                        
                        {feuille.dayOn.map((day, index) => (
                            <View key={index}>
                                <Text className='date'>{day.date}</Text>
                                <Text><strong>Ville</strong> : {day.city}</Text>
                                <Text><strong>Distance totale</strong> : {day.totalKm} km</Text>
                                <Text><strong>Visites</strong> :</Text>
                                <View>
                                    <View>
                                        <View>
                                            <Text>Nom</Text>
                                            <Text>Distance</Text>
                                            <Text>Status</Text>
                                        </View>
                                    </View>
                                    <View>
                                        {day.stops.map((stop, idx) => (
                                            <View key={idx}>
                                                <Text>{stop.name}</Text>
                                                <Text>{stop.distance} km</Text>
                                                <Text>{stop.status}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>
            <View className="dayOff-section">
                {feuille.dayOff && feuille.dayOff.length > 0 && (
                    <View>
                        {feuille.dayOff.map((day, index) => (
                             
                            <View className='feuille-jj' key={index}>
                                <Text className='date'>{day.date}</Text>
                                <Text>Visites effectuées : Non</Text>
                                <Text>Motif de non-visite : {day.motifNoVisits}</Text>
                            </View>
                        ))} 
                    </View>    
                )}
            </View>
            <View className='signature-draw'>
                
                <Image src={feuille.signature} />
                <Text>Signé le : {feuille.dateSignature}</Text>  
            </View>
        </Page>
    ))}

</Document>
)
export default FeuillesDeRoutePDF;*/