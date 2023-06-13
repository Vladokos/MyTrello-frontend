import React, { useState } from "react";

import { Draggable } from "react-beautiful-dnd";

import descriptionImg from "../../img/description.svg";

import "../../styles/Board/Card.css";

export const Card = ({
  card,
  index,
  visibleChangeCard,
  visibleChangeNameCard,
}) => {
  
  const [name, setNameCard] = useState(card.nameCard)
  return (
    <Draggable
      key={card._id}
      draggableId={card._id}
      index={index}
      id={card._id}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="cards" style={card.descriptionCard.length !== 0 ? null : null}>
            <div
              className="card"
              key={card._id}
              onClick={(e) =>
                visibleChangeCard(e, card._id, card.descriptionCard, card.nameCard)
              }
            >
              {card.nameCard.length > 52 ? name.substring(0, 45) + "..." : card.nameCard}
              {card.descriptionCard.length !== 0 ? (
                <div>
                  <img src={descriptionImg} />
                </div>
              ) : null}
            </div>
            <span
              onClick={(e) => visibleChangeNameCard(e, card.nameCard, card._id)}
            ></span>
          </div>
        </div>
      )}
    </Draggable>
  );
};
