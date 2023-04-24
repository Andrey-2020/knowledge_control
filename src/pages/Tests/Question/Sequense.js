import React, {
  useState,
  useCallback,
  useEffect
} from 'react';
import './Match.css';
import update from 'immutability-helper';
import  { ListItem }  from './ListItem'


/**
 * Выстраивание правильной последовательности
 * 
 * @param {{
 *   answers: string[],
 *   onAnswer: import('../Test').onAnswerCallback,
 * }}
 */
export default function Sequense({ answers, onAnswer }) {
  // const [answer, setAnswer] = useState([]);
  // const handleChange = useCallback((value, index) => {
  //   let isRepeat;
  //   let count;
  //   // if (answer[index]) {
  //   //   answer.splice(index, 1, value);
  //   //   isRepeat = true;
  //   //   console.log(answer)
  //   // }
  //   if (!isRepeat) {

  //     setAnswer((oldQuestions) => [...oldQuestions, value]);
  //   }

  // }, [answer]);
  // useEffect(() => {
  //   onAnswer(answer);
  //   console.log(answer)
  // }, [onAnswer, answer]);
  const [cards, setCards] = useState(answers);
  /* eslint-disable no-unused-vars */
  const [cardsId, setCardsId] = useState([]);
  // const countCards = cards.length();
  useEffect(() => {
    cards.forEach((item, index) => {
      cardsId[index]=item.id;
    });
    onAnswer(cardsId);
  }, [onAnswer, cards, cardsId]);

  const moveCard = useCallback((dragIndex, hoverIndex) => {
    const dragCard = cards[dragIndex];
    setCards(update(cards, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, dragCard],
      ],
    }));
  }, [cards]);

  return (
    <div className="questionComparis">
      <div className="questionComparis__lists">
        <ul className="questionComparis__leftList questionComparis__leftList_sequence">
          {/* {console.log(answers)} */}
          {cards.map((answer, index) => (
            <ListItem
              key={answer.id}
              id={answer.id}
              index={index}
              cards ={cards}
              text={answer.answer}
              moveCard={moveCard}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
