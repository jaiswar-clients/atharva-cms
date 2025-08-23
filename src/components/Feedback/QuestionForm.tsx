"use client"
import React, { useState } from 'react'
import Typography from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit2, Trash2, Save, X, Tag } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export interface FeedbackQuestion {
  _id?: string
  question_text: string
  category: string
  max_rating: number
  order: number
}

interface QuestionFormProps {
  questions: FeedbackQuestion[]
  onChange: (questions: FeedbackQuestion[]) => void
  isReadOnly?: boolean
}

// Default categories if no questions exist yet
const DEFAULT_CATEGORIES = [
  'Service Quality',
  'Content Quality',
  'User Experience',
  'Technical Issues',
  'General Feedback',
  'Course Quality',
  'Support',
  'Features',
  'Performance',
  'Other'
]

const QuestionForm: React.FC<QuestionFormProps> = ({
  questions,
  onChange,
  isReadOnly = false
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<FeedbackQuestion>({
    question_text: '',
    category: 'General Feedback',
    max_rating: 5,
    order: 0
  })
  const [newCategoryInput, setNewCategoryInput] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)

  // Extract unique categories from existing questions
  const existingCategories = Array.from(new Set(questions.map(q => q.category)))
  const allCategories = Array.from(new Set([...existingCategories, ...DEFAULT_CATEGORIES]))

  const handleAddQuestion = () => {
    const newQuestion: FeedbackQuestion = {
      question_text: '',
      category: 'General Feedback',
      max_rating: 5,
      order: questions.length + 1
    }
    setEditingQuestion(newQuestion)
    setEditingIndex(questions.length)
  }

  const handleAddNewCategory = () => {
    const trimmedCategory = newCategoryInput.trim()
    if (!trimmedCategory) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive"
      })
      return
    }

    if (allCategories.includes(trimmedCategory)) {
      toast({
        title: "Error",
        description: "Category already exists",
        variant: "destructive"
      })
      return
    }

    // Update the current editing question with the new category
    setEditingQuestion(prev => ({
      ...prev,
      category: trimmedCategory
    }))

    setNewCategoryInput('')
    setShowAddCategory(false)

    toast({
      title: "Success",
      description: `Category "${trimmedCategory}" added and assigned to current question`,
      variant: "default"
    })
  }

  const handleEditQuestion = (index: number) => {
    setEditingQuestion({ ...questions[index] })
    setEditingIndex(index)
  }

  const handleSaveQuestion = () => {
    if (!editingQuestion.question_text.trim()) {
      toast({
        title: "Error",
        description: "Question text is required",
        variant: "destructive"
      })
      return
    }

    if (editingIndex !== null) {
      const updatedQuestions = [...questions]
      if (editingIndex === questions.length) {
        // Adding new question
        updatedQuestions.push(editingQuestion)
      } else {
        // Updating existing question
        updatedQuestions[editingIndex] = editingQuestion
      }

      // Update order numbers
      updatedQuestions.forEach((q, index) => {
        q.order = index + 1
      })

      onChange(updatedQuestions)
      setEditingIndex(null)
      setEditingQuestion({
        question_text: '',
        category: 'General Feedback',
        max_rating: 5,
        order: 0
      })

      toast({
        title: "Success",
        description: editingIndex === questions.length ? "Question added successfully" : "Question updated successfully",
        variant: "default"
      })
    }
  }

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index)
    // Update order numbers
    updatedQuestions.forEach((q, i) => {
      q.order = i + 1
    })
    onChange(updatedQuestions)

    toast({
      title: "Success",
      description: "Question deleted successfully",
      variant: "default"
    })
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditingQuestion({
      question_text: '',
      category: 'General Feedback',
      max_rating: 5,
      order: 0
    })
    setNewCategoryInput('')
    setShowAddCategory(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <Typography variant="h2">Questions</Typography>
          <div className="flex gap-2">
            {!isReadOnly && (
              <>
                <Button
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  variant="outline"
                  size="sm"
                >
                  <Tag size={16} />
                  <span className="ml-2">Add Category</span>
                </Button>
                <Button onClick={handleAddQuestion} size="sm">
                  <Plus size={16} />
                  <span className="ml-2">Add Question</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Add Category Form */}
        {showAddCategory && !isReadOnly && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25">
            <div className="flex gap-2">
              <Input
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                placeholder="Enter new category name..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddNewCategory()
                  }
                }}
              />
              <Button onClick={handleAddNewCategory} size="sm">
                Add
              </Button>
              <Button
                onClick={() => {
                  setShowAddCategory(false)
                  setNewCategoryInput('')
                }}
                variant="outline"
                size="sm"
              >
                <X size={16} />
              </Button>
            </div>
            <Typography variant="p" className="text-sm text-muted-foreground mt-2">
              This category will be available for all future questions
            </Typography>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-8">
            <Typography variant="p" className="text-muted-foreground mb-4">
              No questions added yet. Click &quot;Add Question&quot; to get started.
            </Typography>
            {!isReadOnly && (
              <Button onClick={handleAddQuestion} variant="outline">
                <Plus size={16} />
                <span className="ml-2">Add First Question</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="border rounded-lg p-4">
                {editingIndex === index ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`question-${index}`}>Question Text</Label>
                      <Textarea
                        id={`question-${index}`}
                        value={editingQuestion.question_text}
                        onChange={(e) => setEditingQuestion(prev => ({
                          ...prev,
                          question_text: e.target.value
                        }))}
                        placeholder="Enter your question here..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`category-${index}`}>Category</Label>
                        <Select
                          value={editingQuestion.category}
                          onValueChange={(value) => setEditingQuestion(prev => ({
                            ...prev,
                            category: value
                          }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {allCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`max-rating-${index}`}>Max Rating</Label>
                        <Select
                          value={editingQuestion.max_rating.toString()}
                          onValueChange={(value) => setEditingQuestion(prev => ({
                            ...prev,
                            max_rating: parseInt(value)
                          }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                              <SelectItem key={rating} value={rating.toString()}>
                                {rating} Stars
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveQuestion} size="sm">
                        <Save size={16} />
                        <span className="ml-1">Save</span>
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm">
                        <X size={16} />
                        <span className="ml-1">Cancel</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Typography variant="h3" className="text-sm font-medium mb-1">
                          Question {index + 1}
                        </Typography>
                        <Typography variant="p" className="text-sm mb-2">
                          {question.question_text}
                        </Typography>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Category: {question.category}</span>
                          <span>Max Rating: {question.max_rating}</span>
                          <span>Order: {question.order}</span>
                        </div>
                      </div>

                      {!isReadOnly && (
                        <div className="flex gap-1 ml-4">
                          <Button
                            onClick={() => handleEditQuestion(index)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            onClick={() => handleDeleteQuestion(index)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default QuestionForm
