from pydantic import BaseModel, Field
from typing import List
from enum import Enum

"""
File: prompt.py
Module: bluf-module
Author: Muhammad Bilal Khan
Description:
    - This file contains the schema for the prompts used by the AI models.
    -  The prompts are defined using the Pydantic BaseModel class.
    
License: MIT License
Copyright (c) 2024 Turing Sandbox

Modified History:
    - 2024-11-01: Creation of the file.
"""

DEFAULT_PROMPT = """
You are an expert summarization model, trained to create concise yet informative 
summaries similar to Distill BERT. Your task is to generate summaries that capture 
the core meaning and key details while maintaining brevity and clarity.

Key Instructions:
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
"""

USER_PROMPT_FORMAT = f"""
Analyze the following text and create a comprehensive two-paragraph summary. The first paragraph
should provide context and main ideas, while the second should elaborate on key details and
implications. Maintain academic rigor while ensuring accessibility to a general audience.

Example Input-Output Pair:

Input: [Research paper about effects of caffeine on productivity]

Output:
Coffee consumption and its impact on workplace productivity has been extensively studied across
multiple industries and demographics. A comprehensive analysis of 2,000 participants across 50
companies revealed that moderate caffeine intake, defined as 200-300mg per day, consistently
correlates with improved cognitive performance during standard working hours. The study,
conducted over 18 months, employed both quantitative productivity metrics and qualitative
employee feedback to establish these findings.

The research identified specific performance improvements in areas of focus, task completion,
and creative problem-solving, with peak benefits occurring approximately 30 minutes after
caffeine consumption. Notably, participants demonstrated a 27% increase in sustained attention
spans and a 21% improvement in meeting deadline adherence when following optimal caffeine
consumption patterns. However, these benefits were found to diminish significantly when daily
intake exceeded 400mg, suggesting an important ceiling effect for workplace caffeine
consumption.

Response Format:
[Paragraph 1: Context and Main Ideas]
[Paragraph 2: Key Details and Implications]

The following is the input you will receive:
"""


class Models(str, Enum):
    LLAMA_3B_PREVIEW = "meta-llama/llama-3.2-3b-instruct:free"
    GEMINI_FLASH_8B = "google/gemini-flash-1.5-8b-exp"
    ZEPHYR_7B = "huggingfaceh4/zephyr-7b-beta:free"


class Params(BaseModel):
    model: str = Models.LLAMA_3B_PREVIEW
    temperature: float = Field(
        0.5,
        description="Controls the randomness of the generated text. Lower values is "
                    "more random, while higher values is more deterministic.",
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
    user_prompt: str = USER_PROMPT_FORMAT
    system_prompt: str = DEFAULT_PROMPT
