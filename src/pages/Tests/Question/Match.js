import React, {
  useState,
  useCallback,
  useEffect
} from 'react';
import { Select } from 'antd';
import './Match.css';

/**
 * Сопоставление элементов между собойвыаываыва
 * 
 * @param {{
 *   answers: string[],
 *   onAnswer: import('../Test').onAnswerCallback,
 * }}
 */
export default function Match({ answers, onAnswer }) {
  // const [selectAnswer, setSelectAnswer] = useState([]);

  const [questions, setQuestions] = useState([]);
  const handleChange = useCallback((newQuestion) => {
    let isRepeat = false;
    questions.forEach((item) => {
      if (newQuestion.value === item.value) {
        item.key = newQuestion.key
        isRepeat = true;
        console.log(item)
      }
    })
    if (!isRepeat) {
      setQuestions((oldQuestions) => [...oldQuestions, newQuestion]);
    }
    questions.sort((prev, next) => prev.key - next.key);
  }, [questions]);

  useEffect(() => {
    onAnswer(questions);
    // console.log(questions)
  }, [onAnswer, questions]);

  useEffect(() => {
    answers.forEach((item) => {
      setQuestions((oldQuestions) => [...oldQuestions,  {key: '', value: item.value.id}]);
    })
    console.log(questions)
    // console.log(questions)
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return (
    <div className="questionComparis">
      <div className="questionComparis__lists">
        <div className="questionComparis__leftList">
          {/* {console.log(answers)} */}
          <div className="questionComparis__rowList">
            <div className="questionComparis__header-table"></div>
            <div className="questionComparis__header-table"></div>
            </div>        
          {answers.map((answer) => (
            <div className="questionComparis__rowList">
              {/* <div className="questionComparis__rowList-text" value={answer.key.answer}></div> */}
              <Select
               style={{ width: 200 }} 
                onChange={
                  (value) => {
                    console.log(answer.value.id)
                    handleChange({
                      "key": value,
                      "value": answer.value.id
                    });
                  }}
                options={
                  answers.map((answer) => ({
                    value: answer.key.id,
                    label: answer.key.answer,
                  }))
                } />
              <div className="questionComparis__rowList">
                <div className="" >{answer.value.answer}</div>
              </div>
            </div>
          ))}
        </div>
        {/* <div className="questionComparis__leftRight">
          {answers.map((answer, index) => (

          ))}
        </div> */}
      </div>
    </div>
  );
}
