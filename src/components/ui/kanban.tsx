"use client";

import React, {
  Dispatch,
  SetStateAction,
  useState,
  DragEvent,
} from "react";
import { FiTrash } from "react-icons/fi";
import { motion } from "framer-motion";
import { FaFire } from "react-icons/fa";
import { cn } from "@/lib/utils";

export type ColumnType = "novo" | "em_analise" | "respondido" | "arquivado";

export type CardType = {
  id: string;
  column: ColumnType;
  projectName: string;
  projectId: string;
  submittedAt: string;
  sessionId: string;
  responseData?: any;
};

type KanbanProps = {
  cards: CardType[];
  setCards: Dispatch<SetStateAction<CardType[]>>;
  onCardClick: (card: CardType) => void;
};

export const Kanban = ({ cards, setCards, onCardClick }: KanbanProps) => {
  return (
    <div className={cn("h-full w-full bg-background text-foreground")}>
      <Board cards={cards} setCards={setCards} onCardClick={onCardClick} />
    </div>
  );
};

type BoardProps = {
  cards: CardType[];
  setCards: Dispatch<SetStateAction<CardType[]>>;
  onCardClick: (card: CardType) => void;
};

const Board = ({ cards, setCards, onCardClick }: BoardProps) => {
  return (
    <div className="flex h-full w-full gap-3 overflow-x-auto p-6">
      <Column
        title="Novo"
        column="novo"
        headingColor="text-blue-500"
        cards={cards}
        setCards={setCards}
        onCardClick={onCardClick}
      />
      <Column
        title="Em Análise"
        column="em_analise"
        headingColor="text-yellow-500"
        cards={cards}
        setCards={setCards}
        onCardClick={onCardClick}
      />
      <Column
        title="Respondido"
        column="respondido"
        headingColor="text-green-500"
        cards={cards}
        setCards={setCards}
        onCardClick={onCardClick}
      />
      <Column
        title="Arquivado"
        column="arquivado"
        headingColor="text-muted-foreground"
        cards={cards}
        setCards={setCards}
        onCardClick={onCardClick}
      />
      <BurnBarrel setCards={setCards} />
    </div>
  );
};

type ColumnProps = {
  title: string;
  headingColor: string;
  cards: CardType[];
  column: ColumnType;
  setCards: Dispatch<SetStateAction<CardType[]>>;
  onCardClick: (card: CardType) => void;
};

const Column = ({
  title,
  headingColor,
  cards,
  column,
  setCards,
  onCardClick,
}: ColumnProps) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e: DragEvent, card: CardType) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDragEnd = (e: DragEvent) => {
    const cardId = e.dataTransfer.getData("cardId");

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before || "-1";

    if (before !== cardId) {
      let copy = [...cards];

      let cardToTransfer = copy.find((c) => c.id === cardId);
      if (!cardToTransfer) return;
      cardToTransfer = { ...cardToTransfer, column };

      copy = copy.filter((c) => c.id !== cardId);

      const moveToBack = before === "-1";

      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before);
        if (insertAtIndex === undefined) return;

        copy.splice(insertAtIndex, 0, cardToTransfer);
      }

      setCards(copy);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    highlightIndicator(e);

    setActive(true);
  };

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators();

    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const highlightIndicator = (e: DragEvent) => {
    const indicators = getIndicators();

    clearHighlights(indicators);

    const el = getNearestIndicator(e, indicators);

    el.element.style.opacity = "1";
  };

  const getNearestIndicator = (e: DragEvent, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();

        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  const getIndicators = () => {
    return Array.from(
      document.querySelectorAll(
        `[data-column="${column}"]`
      ) as unknown as HTMLElement[]
    );
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const filteredCards = cards.filter((c) => c.column === column);

  return (
    <div className="w-72 shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <span className="rounded text-sm text-muted-foreground">
          {filteredCards.length}
        </span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors rounded-lg ${
          active ? "bg-accent/50" : "bg-accent/0"
        }`}
      >
        {filteredCards.map((c) => {
          return (
            <Card
              key={c.id}
              {...c}
              handleDragStart={handleDragStart}
              onClick={() => onCardClick(c)}
            />
          );
        })}
        <DropIndicator beforeId={null} column={column} />
      </div>
    </div>
  );
};

type CardProps = CardType & {
  handleDragStart: Function;
  onClick: () => void;
};

const Card = ({
  projectName,
  submittedAt,
  id,
  column,
  handleDragStart,
  onClick,
}: CardProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onDragStart={(e) =>
          handleDragStart(e, { id, column, projectName, submittedAt })
        }
        onClick={onClick}
        className="cursor-pointer rounded border border-border bg-card p-3 mb-2 hover:bg-accent/50 transition-colors active:cursor-grabbing"
      >
        <p className="text-sm font-medium text-foreground mb-1">
          {projectName}
        </p>
        <p className="text-xs text-muted-foreground">{formatDate(submittedAt)}</p>
      </motion.div>
    </>
  );
};

type DropIndicatorProps = {
  beforeId: string | null;
  column: string;
};

const DropIndicator = ({ beforeId, column }: DropIndicatorProps) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-0.5 h-0.5 w-full bg-primary opacity-0"
    />
  );
};

const BurnBarrel = ({
  setCards,
}: {
  setCards: Dispatch<SetStateAction<CardType[]>>;
}) => {
  const [active, setActive] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  const handleDragEnd = (e: DragEvent) => {
    const cardId = e.dataTransfer.getData("cardId");

    setCards((pv) => pv.filter((c) => c.id !== cardId));

    setActive(false);
  };

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl ${
        active
          ? "border-destructive bg-destructive/20 text-destructive"
          : "border-border bg-muted/20 text-muted-foreground"
      }`}
    >
      {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
    </div>
  );
};
