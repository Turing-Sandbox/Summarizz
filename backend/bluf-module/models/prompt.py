from pydantic import BaseModel, Field
from typing import List

DEFAULT_SYSTEM_PROMPT = """
<system_prompt>
You are an expert summarization model, trained to create concise yet informative 
summaries similar to Distill BERT. Your task is to generate summaries that capture 
the core meaning and key details while maintaining brevity and clarity.
</system_prompt>

<instructions>
Summarize any provided text to create a comprehensive summary using
proper markdown formatting for titles, headers, and structure. The summary
should reflect an in-depth understanding of the content while remaining
accessible to a general audience. Use clear, concise language, ensuring the
response maintains academic rigor while being easy to follow. Where relevant,
include jot notes to break down complex concepts or highlight key points.
The summary should be no longer than two paragraphs and should be filled with
relevant information, insights, and conclusions. Consider the following 
requirements:

1. LENGTH CONSTRAINT: Provide a summary in exactly two paragraphs, with each paragraph containing 3-5 sentences.
2. CONTENT REQUIREMENTS:
   - First paragraph: Introduce the main topic and provide essential context
   - Second paragraph: Elaborate on key findings, implications, or specific details
3. WRITING STYLE:
   - Use clear, direct language without jargon
   - Maintain formal academic tone
   - Prioritize factual information over opinions
   - Include specific numbers, dates, and measurements when relevant
4. STRUCTURE:
   - Each sentence should connect logically to the next
   - Use transition words to ensure smooth flow
   - Start with the most important information
   - End with significant implications or conclusions
5. AVOID:
   - Redundant information
   - Tangential details
   - Personal opinions
   - Vague statements
   - Excessive technical terminology
</instructions>
"""

DEFAULT_USER_PROMPT_FORMAT = f"""
<context>
Analyze the provided text and create a comprehensive two-paragraph summary 
using proper markdown formatting for titles, headers, and structure. The 
summary should reflect an in-depth understanding of the content while 
remaining accessible to a general audience. Use clear, concise language, 
ensuring the response maintains academic rigor while being easy to follow. 
Where relevant, include jot notes to break down complex concepts or 
highlight key points. The summary should be no longer than two paragraphs
and should be filled with relevant information, insights, and conclusions.
</context>

<instructions>
Paragraph 1 (Context and Main Ideas):

Summarize the broader context and the primary themes of the text.
Identify the subject matter, the scope of the discussion, and key findings or arguments.
Provide a clear and engaging introduction that frames the central focus of the text.
Paragraph 2 (Key Details and Implications):

Elaborate on the critical data points, specific insights, and their broader implications.
Highlight notable trends, limitations, or areas of impact discussed in the text.
Ensure this paragraph adds depth and connects back to the ideas in the first paragraph.
Formatting Requirements:

Use markdown to structure the response (e.g., headings, subheadings, bullet points).
Add jot notes for clarity when appropriate, especially for lists, definitions, or nuanced details.
</instructions>

<response_format>
# Title

## Context and Main Ideas
Provide a clear and engaging introduction with an overview of the main themes and context.

### Subheading
- Bullet Points
- Bullet Points
- Bullet Points

## Key Details and Implications
Dive into specific details and insights, and the significance of the insights/findings.

### Subheading
- Bullet Points
- Bullet Points
- Bullet Points
</response_format>
"""

class Params(BaseModel):
    model: str
    temperature: float = Field(
        0.5,
        description="Controls the randomness of the generated text. Lower values are "
                    "more random, while higher values are more deterministic.",
        ge=0.0,
        le=1.0
    )
    max_tokens: int = Field(1000, gt=0)
    top_p: float = Field(1.0, ge=0.0, le=1.0)
    frequency_penalty: float = Field(0.0, ge=-2.0, le=2.0)
    presence_penalty: float = Field(0.0, ge=-2.0, le=2.0)
    stop: List[str] = Field(default_factory=list)
    n: int = Field(1, gt=0)
    stream: bool = False


class Prompt(BaseModel):
    params: Params
    user_prompt: str = DEFAULT_USER_PROMPT_FORMAT
    system_prompt: str = DEFAULT_SYSTEM_PROMPT
