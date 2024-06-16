// fichier Recap.js

import { useState, useEffect } from "react";
import { db } from "../firebase.config";
import { collection, getDocs } from "firebase/firestore";
import { format, startOfWeek, isWithinInterval } from "date-fns";

function Recap() {
  const [visitsSummary, setVisitsSummary] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState({ start: '', end: '' });
  const [filteredSummary, setFilteredSummary] = useState({});
  const [usersMap, setUsersMap] = useState({})  

  useEffect(() => {
    const fetchData = async () => {
      const feuillesDeRouteRef = collection(db, "feuillesDeRoute");
      const snapshot = await getDocs(feuillesDeRouteRef);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const summary = data.reduce((acc, doc) => {
        const { userId, stops, date } = doc;

        // Conversion de la date
        let parsedDate;
        if (date instanceof Date) {
          parsedDate = date;
        } else if (date.seconds) {
          parsedDate = date.toDate();
        } else {
          parsedDate = new Date(date);
        }

        if (!isNaN(parsedDate.getTime())) { // Vérifions si la date est valide
          const weekStart = format(startOfWeek(parsedDate), "yyyy-MM-dd");

          if (!acc[userId]) {
            acc[userId] = { totalVisits: 0, weeklyVisits: {}, visits: [] };
          }

          acc[userId].totalVisits += stops.length;
          acc[userId].visits.push({ date: parsedDate, count: stops.length });

          if (!acc[userId].weeklyVisits[weekStart]) {
            acc[userId].weeklyVisits[weekStart] = 0;
          }
          acc[userId].weeklyVisits[weekStart] += stops.length;
        }

        return acc;
      }, {});

      setVisitsSummary(summary);
      setFilteredSummary(summary); // Initially, the filtered summary is the same as the overall summary
    };

    fetchData();
  }, []);

  // Récupère les nom et prénom des users
  useEffect(() => {
    const fetchUsersData = async () => {
        const usersData = {};
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            usersSnapshot.forEach((doc) => {
                usersData[doc.id] = doc.data();
            });
            setUsersMap(usersData);
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs : ", error);
        }
    }; 
    fetchUsersData();
}, []);

  const handlePeriodChange = (e) => {
    setSelectedPeriod({ ...selectedPeriod, [e.target.name]: e.target.value });
  };

  const applyPeriodFilter = () => {
    const { start, end } = selectedPeriod;
    if (!start || !end) return;

    const startDate = new Date(start);
    const endDate = new Date(end);

    const filtered = Object.entries(visitsSummary).reduce((acc, [userId, data]) => {
      const filteredVisitsCount = data.visits.reduce((count, visit) => {
        if (isWithinInterval(visit.date, { start: startDate, end: endDate })) {
          return count + visit.count;
        }
        return count;
      }, 0);

      acc[userId] = { ...data, filteredVisits: filteredVisitsCount };
      return acc;
    }, {});

    setFilteredSummary(filtered);
  };

  const renderTableData = () => {
    const thisWeekStart = startOfWeek(new Date());

    return Object.entries(filteredSummary).map(([userId, data]) => {
      const thisWeekVisits = data.visits.reduce((count, visit) => {
        if (isWithinInterval(visit.date, { start: thisWeekStart, end: new Date() })) {
          return count + visit.count;
        }
        return count;
      }, 0);

      return (
        <tr key={userId}>
          <td>{usersMap[userId]?.lastname} {usersMap[userId]?.firstname}</td>
          <td style={{textAlign: "center"}}>{thisWeekVisits}</td>  
          <td style={{textAlign: "center"}}>{data.filteredVisits}</td>
        </tr>
      );
    });
  };

  return (
    <div className="recap"> 
      <h2>Récapitulatif du nombre de visites</h2>
      <table>
        <thead>
          <tr>
            <th>Nom VRP</th>
            <th>Cette semaine</th>
            <th className="date">
              <div>
                Du <input type="date" name="start" value={selectedPeriod.start} onChange={handlePeriodChange}/><br></br>
                Au <input type="date" name="end" value={selectedPeriod.end} onChange={handlePeriodChange} />
              </div>
                <button onClick={applyPeriodFilter}>OK</button>
            </th>
          </tr>
        </thead>
        <tbody>{renderTableData()}</tbody>
      </table>
    </div>
  );
}

export default Recap;
