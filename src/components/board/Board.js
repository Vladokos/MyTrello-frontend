import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { DragDropContext, Droppable } from "react-beautiful-dnd";

import { useSelector, useDispatch } from "react-redux";
import {
  getBoard,
  getBoards,
  changeLists,
  changeData,
  removeBoards,
} from "../../features/boards/boardsSlice";
import {
  getLists,
  getList,
  sortingLists,
  changeCards,
  removeList,
} from "../../features/lists/listsSlice";
import { getCards, getCard, removeCard } from "../../features/card/cardsSlice";

import useWindowHeight from "../../hooks/heightWindowHook";

import { Loader } from "../blanks/Loader";
import { Header } from "../blanks/Header";
import { CreateBoards } from "../CreateBoards";
import { BoardName } from "./BoardName";
import { List } from "./List";
import { CreateList } from "./CreateList";
import { ChangeCard } from "./ChangeCard";
import { ChangeNameCard } from "./ChangeNameCard";
import { Menu } from "./Menu";

import "../../styles/Board/Board.css";
import { store } from "../../app/store";
import { unwrapResult } from "@reduxjs/toolkit";

export const Board = ({ socket }) => {
  const navigate = useNavigate();
  const params = useParams();

  const { height } = useWindowHeight();

  const dispatch = useDispatch();
  const { boards } = useSelector((state) => state.boards);
  const { lists } = useSelector((state) => state.lists);
  const { cards, status } = useSelector((state) => state.cards);

  let setSavedBoards = boards;

  const [createShow, setCreateShow] = useState(false);

  const [changeCard, setChangeCard] = useState(false);
  const [changeNameCard, setChangeNameCard] = useState(false);

  const [nameCard, setNameCard] = useState("");
  const [descriptionCard, setDescriptionCard] = useState("");

  const [cardId, setCardId] = useState(null);

  const [xPos, setXPos] = useState(null);
  const [yPos, setYPos] = useState(null);

  const [connect, setConnect] = useState(false);

  const visibleChangeCard = (e, id, description, name) => {
    if (e.target.innerText === "") return null;
    setCardId(id);

    setNameCard(name);
    setDescriptionCard(description);

    setChangeCard(true);
  };

  const visibleChangeNameCard = (e, nameCard, id) => {
    setNameCard(nameCard);

    setCardId(id);

    setXPos(e.target.getBoundingClientRect().x);
    setYPos(e.target.getBoundingClientRect().y);

    setChangeNameCard(true);
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) navigate("/sig");

    try {
      socket.emit("tokenVerify", JSON.parse(accessToken));
    } catch (error) {
      socket.emit("tokenVerify", accessToken);
    }

    socket.on("tokenVerify", (data) => {
      if (data !== "Error") {
        const { newToken, idUser, userName } = data;

        const { boardId } = params;

        if (newToken) localStorage.setItem("accessToken", newToken);

        localStorage.setItem("userId", idUser);
        localStorage.setItem("userName", userName);

        socket.emit("checkUser", { idUser, boardId });

        socket.off("tokenVerify");
      } else {
        navigate("/error/404");
      }
    });

    socket.on("checkUser", (data) => {
      if (data !== "Error") {
        const userId = localStorage.getItem("userId");

        const { boardId } = params;

        const date = Date.now();
        dispatch(changeData({ boardId, date }));

        if (store.getState().boards.boards.length === 0) {


          dispatch(getBoards(userId));
        }

        const lists = store.getState().lists.lists;

        const amountLists = store.getState().boards.boards.find((board) => {
          if (board._id === boardId) {
            return board;
          }
        })?.lists.length;

        if (amountLists !== lists.length) {
          dispatch(getLists(boardId)).unwrap().then(unwrapResult).then((res) => {


            dispatch(getBoards(userId)).unwrap().then(unwrapResult).then((res) => {



            });

          });
          dispatch(getCards(boardId));
        }

        socket.off("checkUser");
      } else {
        const userId = localStorage.getItem("userId");
        const userName = localStorage.getItem("userName");
        console.log('userId3');

        dispatch(getBoards(userId));

        navigate(`/${userName}/boards`);
      }
    });
  }, [params]);

  useEffect(() => {

    socket.on("bond", (data) => {
      const { boardId } = params;

      const { message, position } = data;
      const { listId, currentListId } = data;
      const { cardId, fromListId, toListId } = data;

      const userId = localStorage.getItem("userId");


      switch (message) {
        case "Update board":
          dispatch(getBoard(boardId));

          break;
        case "Update lists":

          const idUser = localStorage.getItem("userId");
          dispatch(getBoards(idUser)).unwrap()
            .then((originalPromiseResult) => {
              const res = originalPromiseResult;
              console.log(originalPromiseResult);
              dispatch(getLists(boardId)).unwrap()
                .then((originalPromiseResult) => {
                  dispatch(sortingLists(res));
                  console.log(originalPromiseResult);
                })
                .catch((rejectedValueOrSerializedError) => {
                  console.log(rejectedValueOrSerializedError);

                })
            })
            .catch((rejectedValueOrSerializedError) => {
              console.log(rejectedValueOrSerializedError);

            })



          break;
        case "Update list":
          dispatch(getList(listId));

          break;
        case "Delete list":
          dispatch(removeList(listId));
          break;

        case "Move list":
          dispatch(changeLists({ position, boardId, currentListId }));
          break;

        case "Update cards":
          
          const idUse = localStorage.getItem("userId");
          dispatch(getBoards(idUse)).unwrap()
            .then((originalPromiseResult) => {
              const res = originalPromiseResult;
              console.log(originalPromiseResult);
              dispatch(getLists(boardId)).unwrap()
                .then((originalPromiseResult) => {
                  dispatch(sortingLists(res));
                  console.log(originalPromiseResult);
                })
                .catch((rejectedValueOrSerializedError) => {
                  console.log(rejectedValueOrSerializedError);

                })
            })
            .catch((rejectedValueOrSerializedError) => {
              console.log(rejectedValueOrSerializedError);

            })
          // dispatch(getLists(boardId)).unwrap().then(unwrapResult).then((res) => {
          //   dispatch(sortingLists(boards));
          // });

          dispatch(getCards(boardId));

          break;

        case "Update card":
          dispatch(getCard(cardId));

          break;

        case "Delete card":
          dispatch(removeCard({ cardId }));

          break;

        case "Move card":
          dispatch(getList(fromListId));
          dispatch(getList(toListId));

          break;
        case "disconnect":
          const userId = localStorage.getItem("userId");
          const userName = localStorage.getItem("userName");

          dispatch(removeBoards());

          navigate(`/${userName}/boards`);

          break;
        default:
          break;
      }
    });
  }, [socket]);

  const onDrop = (e) => {
    if (e.type === "list") {
      const position = e.destination.index;
      const { boardId } = params;
      const currentListId = e.draggableId;

      dispatch(changeLists({ position, boardId, currentListId })).unwrap().then(unwrapResult).then((originalPromiseResult) => {
        socket.emit("bond", {
          roomId: boardId,
          message: "list moved",
          position,
          currentListId,
        });
      });

      // dispatch(changeLists({ position, boardId, currentListId }));

      // socket.emit("bond", {
      //   roomId: boardId,
      //   message: "list moved",
      //   position,
      //   currentListId,
      // });
    } else if (e.type === "card") {
      try {
        const { boardId } = params;

        const fromListId = e.source.droppableId;
        const toListId = e.destination.droppableId;
        const position = e.destination.index;
        const cardId = e.draggableId;

        dispatch(changeCards({ fromListId, toListId, position, cardId })).unwrap().then(unwrapResult).then((originalPromiseResult) => {
          socket.emit("bond", {
            roomId: boardId,
            message: "card moved",
            cardId,
            fromListId,
            toListId,
            position,
          });
        });

        // dispatch(changeCards({ fromListId, toListId, position, cardId }));

        // socket.emit("bond", {
        //   roomId: boardId,
        //   message: "card moved",
        //   cardId,
        //   fromListId,
        //   toListId,
        //   position,
        // });
      } catch (error) { }
    }
  };

  useEffect(() => {

    if (boards.length > 0 && lists.length > 0) {

      boards.map((board) => {
        if (board._id === params.boardId && board.shareLink && !connect) {
          const roomId = params.boardId;
          socket.emit("room", roomId);

          setConnect(true);
        }
      });

      dispatch(sortingLists(boards));
      setSavedBoards = boards;
      // help();

    }
  }, [boards]);

  // useEffect(() => {
  //   if (boards.length > 0 && lists.length > 0) {
  //     dispatch(sortingLists(boards));
  //   }
  // }, [lists.length])

  const [drag, setDrag] = useState(false);

  return (
    <div className="boardMenu" style={{ height: height }}>
      <Header boards={boards} createShow={() => setCreateShow(true)} />
      <div className="lists" style={{ height: height - 127 }}>
        <div className="container">
          <div className="lists__inner" style={{ height: height - 200 }}>
            {boards.length > 0
              ? boards.map((board) => {
                if (board._id === params.boardId) {
                  return (
                    <div key={board._id} className="action-board">
                      <BoardName name={board.nameBoard} socket={socket} />
                      <Menu
                        height={height - 108}
                        boards={boards}
                        lists={lists}
                        cards={cards}
                        socket={socket}
                        shareLink={board.shareLink}
                      />
                    </div>
                  );
                }
              })
              : null}

            <ul
              className="scrollBoard"
              style={drag === false ? { transform: `translateZ(10px)` } : null}
            >
              <li>
                <DragDropContext
                  onDragStart={() => setDrag(true)}
                  onDragEnd={(e) => {
                    onDrop(e);
                    setDrag(false);
                  }}
                >
                  <Droppable
                    droppableId="lists"
                    direction="horizontal"
                    type="list"
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="sheetList"
                      >
                        {lists.map((list, index) =>
                          !list.archived ? (
                            <List
                              key={list._id + index}
                              boards={boards}
                              listId={list._id}
                              listName={list.nameList}
                              listCards={list.cards}
                              index={index}
                              cards={cards}
                              visibleChangeCard={visibleChangeCard}
                              visibleChangeNameCard={visibleChangeNameCard}
                              height={height - 310}
                              socket={socket}
                            />
                          ) : null
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </li>
              <CreateList socket={socket} />
            </ul>
            <ChangeCard
              nameCard={nameCard}
              descriptionCard={descriptionCard}
              changeDescription={(e) => setDescriptionCard(e.target.value)}
              cardId={cardId}
              changeCard={(e) => setNameCard(e.target.value)}
              isOpen={changeCard}
              closeForm={() => setChangeCard(false)}
              socket={socket}
            />

            {changeNameCard === false ? null : (
              <ChangeNameCard
                nameCard={nameCard}
                changeNameCard={(e) => setNameCard(e.target.value)}
                cardId={cardId}
                closeForm={() => setChangeNameCard(false)}
                xPos={xPos}
                yPos={yPos}
                height={height - 270}
                socket={socket}
              />
            )}
          </div>
        </div>
      </div>
      <CreateBoards
        createShow={createShow}
        changeShow={() => setCreateShow(false)}
        height={height}
        boards={boards}
      />
    </div>
  );
};
