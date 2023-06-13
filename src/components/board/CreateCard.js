import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

import { useDispatch } from "react-redux";
import { getLists, sortingLists } from "../../features/lists/listsSlice";
import { addCard } from "../../features/card/cardsSlice";

import TextareaAutosize from "react-textarea-autosize";

import OutsideClick from "../../hooks/OutsideClick";

import "../../styles/Board/CreateCard.css";

export const CreateCard = ({ listId, boards, formShow, closeForm, socket }) => {
  const params = useParams();
  const dispatch = useDispatch();

  const [nameCard, setNameCard] = useState("");

  const onNameCardChange = (e) => setNameCard(e.target.value);

  const createCard = () => {
    if (nameCard.replace(/ /g, "").length <= 0 || !listId) {
      cardInput.current.focus();
      return null;
    }

    const { boardId } = params;

    // when the card was render(added on the state in redux)
    //  then the popup moves down
    
    dispatch(addCard({ nameCard, boardId, listId })).then(() => {
      dispatch(getLists(boardId)).then(() => {
        dispatch(sortingLists(boards));
        socket.emit("bond", { roomId: boardId, message: "card added" });
      });

    });

    setNameCard("");
  };

  const cardInput = useRef(null);
  const cardFormRef = useRef(null);
  OutsideClick(cardFormRef, closeForm);

  useEffect(() => {
    cardInput?.current?.focus?.();
  }, [cardInput]);
  if (!formShow) return null;
  return (
    <div className="form-createCard" ref={cardFormRef}>
      <div>
        <TextareaAutosize
          placeholder="Enter a title for this card…"
          value={nameCard}
          onChange={onNameCardChange}
          maxRows={3}
          onKeyDown={(e) => (e.key === "Enter" ? createCard() : null)}
          ref={cardInput}
        />
      </div>
      <button onClick={createCard}>Add card</button>
      <button onClick={closeForm}>X</button>
    </div>
  );
};
