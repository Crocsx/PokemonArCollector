import React, { useState, useEffect, useMemo } from "react";
import { Collection } from "./type";
import "react-loading-skeleton/dist/skeleton.css";
import "./App.css";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import { toKatakana } from "wanakana";

const App = () => {
  const [data, setData] = useState<Collection>({ sets: [] });
  const [searchTerm, setSearchTerm] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(
      `https://api.jsonbin.io/v3/b/${process.env.REACT_APP_COLLECTION_ID}`,
      {
        headers: {
          "X-Master-Key": process.env.REACT_APP_X_MASTER_KEY || "",
          "X-Access-Key": process.env.REACT_APP_X_ACCESS_KEY || "",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setData(data.record);
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error(error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleCheckboxChange = (checked: boolean, id: string) => {
    setData((prevData) => {
      const newData = { ...prevData };
      for (let set of newData.sets) {
        for (let card of set.cards) {
          if (card.id === id) {
            card.collected = checked;
            break;
          }
        }
      }
      return newData;
    });
  };

  const handleSave = () => {
    fetch(
      `https://api.jsonbin.io/v3/b/${process.env.REACT_APP_COLLECTION_ID}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": process.env.REACT_APP_X_MASTER_KEY || "",
          "X-Access-Key": process.env.REACT_APP_X_ACCESS_KEY || "",
        },
        body: JSON.stringify(data, null, 2),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setData(data.record);
        toast.success("Saved !");
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error(error);
      })
      .finally(() => setIsSaving(false));
  };

  const totalCards = useMemo(() => {
    return data.sets.reduce((acc, set) => acc + set.cards.length, 0);
  }, [data]);

  const collectedCards = useMemo(() => {
    return data.sets.reduce(
      (total, set) => total + set.cards.filter((card) => card.collected).length,
      0
    );
  }, [data]);

  const filteredData = data.sets.filter((set) =>
    set.cards.some((card) =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div>
      {isLoading ? (
        <div>
          <Skeleton height={30} /> {/* Mimic the collection status */}
          <Skeleton height={50} count={5} /> {/* Mimic the card sets */}
        </div>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(toKatakana(e.target.value))}
          />
          <h2 className="collection-status">
            You have collected {collectedCards} out of {totalCards} cards.
          </h2>
          {filteredData.map(({ title, cards }, i) => (
            <div key={title} className="set">
              <h2 className="set-title">{title}</h2>
              <div className="set-container">
                {cards.map(({ image, link, name, collected, id }, j) => (
                  <div
                    key={id}
                    className={`card ${collected ? "collected" : ""}`}
                  >
                    <img src={image} className="card-img" alt={name} />
                    <div className="card-info">
                      <a
                        href={link}
                        className="card-link"
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {name}
                      </a>
                      <input
                        type="checkbox"
                        className="card-checkbox"
                        checked={collected || false}
                        onChange={(checked) =>
                          handleCheckboxChange(checked.target.checked, id)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
      <button onClick={handleSave} disabled={isSaving}>
        {isLoading ? "Loading..." : "Save"}
      </button>
    </div>
  );
};

export default App;
