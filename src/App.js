import { Table } from 'antd';
import './App.css';

import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const owner = "tapaj";
  const repo = "test";

  const [dataSource, setDataSource] = useState([]);
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "PR Count",
      dataIndex: "count",
      key: "count"
    },
    {
      title: "Additions",
      dataIndex: "additions",
      key: "additions"
    },
    {
      title: "Deletions",
      dataIndex: "deletions",
      key: "deletions"
    }
  ];

  useEffect(() => {

    async function getPullRequest () {
      let key = 0;
      const prApiResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state="closed"`);
      const prData = prApiResponse.data;
  
      const prCleanedData = await Promise.all(prData.map(async (pr) => {
        const pullsUrl = pr.url;
  
        // Getting commit data
        const pullApiResponse = await axios.get(pullsUrl);
        const pullData = pullApiResponse.data;
        key++;
  
        return {
          key: key,
          name: pr.user.login,
          additions: pullData.additions,
          deletions: pullData.deletions
        }
      }));
      
      // Creating a hash map from the cleaned data to combine pull requests from one person
      const prMap = new Map();

      prCleanedData.forEach(pr => {
        if (prMap.get(pr.name) === undefined) {
          pr.count = 1;
          prMap.set(pr.name, pr);
        } else {
          const existingData = prMap.get(pr.name);
          existingData.count++;
          existingData.additions += pr.additions;
          existingData.deletions += pr.deletions;
          prMap.set(pr.name, existingData);
        }
      });

      const consolidatedPrData = Array.from(prMap.values());

      setDataSource(consolidatedPrData)
    }

    getPullRequest();
   
  }, [])

  return (
    <div className="App">
      <div className="table-container">
        <Table dataSource={dataSource} columns={columns} />
      </div>
    </div>
  );
}

export default App;
