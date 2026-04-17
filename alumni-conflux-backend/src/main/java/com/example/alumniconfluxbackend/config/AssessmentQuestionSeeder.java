package com.example.alumniconfluxbackend.config;

import com.example.alumniconfluxbackend.model.AssessmentQuestion;
import com.example.alumniconfluxbackend.repository.AssessmentQuestionRepository;
import com.example.alumniconfluxbackend.util.AssessmentType;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class AssessmentQuestionSeeder implements CommandLineRunner {

    private final AssessmentQuestionRepository assessmentQuestionRepository;

    public AssessmentQuestionSeeder(AssessmentQuestionRepository assessmentQuestionRepository) {
        this.assessmentQuestionRepository = assessmentQuestionRepository;
    }

    @Override
    public void run(String... args) {
        Map<AssessmentType, List<AssessmentQuestion>> allQuestions = Map.of(
                AssessmentType.APTITUDE, aptitudeQuestions(),
                AssessmentType.INTELLIGENCE, intelligenceQuestions(),
                AssessmentType.PERSONALITY, personalityQuestions()
        );

        for (Map.Entry<AssessmentType, List<AssessmentQuestion>> entry : allQuestions.entrySet()) {
            AssessmentType type = entry.getKey();
            long count = assessmentQuestionRepository.countByAssessmentType(type);

            if (count < 8) {
                for (AssessmentQuestion question : entry.getValue()) {
                    boolean exists = assessmentQuestionRepository.existsByAssessmentTypeAndDisplayOrder(
                            question.getAssessmentType(),
                            question.getDisplayOrder()
                    );

                    if (!exists) {
                        assessmentQuestionRepository.save(question);
                    }
                }
            }
        }
    }

    private List<AssessmentQuestion> aptitudeQuestions() {
        return List.of(
                build(AssessmentType.APTITUDE, 1, "If a train travels 120 km in 2 hours, what is its average speed?", List.of("40 km/h", "50 km/h", "60 km/h", "70 km/h"), 2),
                build(AssessmentType.APTITUDE, 2, "What comes next in the series: 2, 6, 12, 20, ?", List.of("28", "30", "32", "34"), 1),
                build(AssessmentType.APTITUDE, 3, "If 15% of a number is 45, what is the number?", List.of("250", "275", "300", "325"), 2),
                build(AssessmentType.APTITUDE, 4, "A shop gives 20% discount on an item priced 2000. Final price is:", List.of("1400", "1500", "1600", "1700"), 2),
                build(AssessmentType.APTITUDE, 5, "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are:", List.of("Lazzies", "Razzies only", "None", "Cannot be determined"), 0),
                build(AssessmentType.APTITUDE, 6, "A can finish a task in 10 days and B in 15 days. Together, they finish in:", List.of("5 days", "6 days", "7 days", "8 days"), 1),
                build(AssessmentType.APTITUDE, 7, "Find the odd one out: 16, 25, 36, 45, 64", List.of("16", "25", "45", "64"), 2),
                build(AssessmentType.APTITUDE, 8, "If the ratio of boys to girls is 3:2 in a class of 40, number of girls is:", List.of("14", "16", "18", "20"), 1)
        );
    }

    private List<AssessmentQuestion> intelligenceQuestions() {
        return List.of(
                build(AssessmentType.INTELLIGENCE, 1, "Which word does not belong: Apple, Banana, Carrot, Mango?", List.of("Apple", "Banana", "Carrot", "Mango"), 2),
                build(AssessmentType.INTELLIGENCE, 2, "Complete analogy: Book is to Reading as Fork is to ?", List.of("Drawing", "Writing", "Eating", "Cooking"), 2),
                build(AssessmentType.INTELLIGENCE, 3, "If all Zips are Nops and some Nops are Lats, which statement is true?", List.of("All Zips are Lats", "Some Zips may be Lats", "No Zips are Lats", "All Lats are Zips"), 1),
                build(AssessmentType.INTELLIGENCE, 4, "What is the next number: 1, 1, 2, 3, 5, 8, ?", List.of("11", "12", "13", "14"), 2),
                build(AssessmentType.INTELLIGENCE, 5, "Which shape has the most lines of symmetry?", List.of("Scalene triangle", "Rectangle", "Square", "Parallelogram"), 2),
                build(AssessmentType.INTELLIGENCE, 6, "If yesterday was Thursday, what day is 3 days after tomorrow?", List.of("Saturday", "Sunday", "Monday", "Tuesday"), 1),
                build(AssessmentType.INTELLIGENCE, 7, "Find the missing letter series: A, C, F, J, ?", List.of("N", "O", "P", "Q"), 1),
                build(AssessmentType.INTELLIGENCE, 8, "Statement: All engineers are problem-solvers. Reason: Engineering requires analytical thinking. Best relation?", List.of("Both true, reason explains statement", "Both true, reason does not explain statement", "Statement true, reason false", "Statement false, reason true"), 0)
        );
    }

    private List<AssessmentQuestion> personalityQuestions() {
        List<String> likert = List.of("Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree");

        return List.of(
                build(AssessmentType.PERSONALITY, 1, "I enjoy meeting new people and starting conversations.", likert, null),
                build(AssessmentType.PERSONALITY, 2, "I prefer planning ahead rather than acting spontaneously.", likert, null),
                build(AssessmentType.PERSONALITY, 3, "I remain calm under pressure.", likert, null),
                build(AssessmentType.PERSONALITY, 4, "I like solving complex problems.", likert, null),
                build(AssessmentType.PERSONALITY, 5, "I pay close attention to details.", likert, null),
                build(AssessmentType.PERSONALITY, 6, "I am comfortable adapting when plans change suddenly.", likert, null),
                build(AssessmentType.PERSONALITY, 7, "I am motivated by helping others succeed.", likert, null),
                build(AssessmentType.PERSONALITY, 8, "I usually finish tasks before the deadline.", likert, null)
        );
    }

    private AssessmentQuestion build(
            AssessmentType type,
            int displayOrder,
            String questionText,
            List<String> options,
            Integer correctOptionIndex
    ) {
        AssessmentQuestion question = new AssessmentQuestion();
        question.setAssessmentType(type);
        question.setDisplayOrder(displayOrder);
        question.setQuestionText(questionText);
        question.setOptions(options);
        question.setCorrectOptionIndex(correctOptionIndex);
        question.setActive(true);
        return question;
    }
}
