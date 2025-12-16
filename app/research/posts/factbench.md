---
title: Checkmate FactBench: Benchmarking LLM Factual Accuracy
date: Dec 16, 2024
category: Fact Verification
description: We introduce Checkmate FactBench, an open-source CLI tool for systematically evaluating language models on factual claim verification using the FEVER dataset.
---

# Checkmate FactBench: Benchmarking LLM Factual Accuracy

As language models become increasingly integrated into information verification workflows, understanding their factual accuracy capabilities is critical. Today, we're releasing **Checkmate FactBench**, an open-source benchmarking tool that evaluates how well LLMs can classify claims as SUPPORTS, REFUTES, or NOT ENOUGH INFO.

## The Problem

Existing fact-checking benchmarks often lack the rigor needed to compare models across different providers and architectures. Researchers and practitioners need:

- **Standardized evaluation** across multiple LLM providers
- **Reproducible results** with caching and detailed reporting
- **Real-time visibility** into evaluation progress and metrics
- **Scalable infrastructure** that can handle large-scale evaluations efficiently

## Introducing Checkmate FactBench

Checkmate FactBench is a CLI tool built on the FEVER (Fact Extraction and VERification) dataset that addresses these challenges. The tool evaluates language models through OpenRouter, enabling comparisons across dozens of models from different providers in a single run.

### Key Features

**Multi-Model Evaluation**: Evaluate multiple models simultaneously, comparing performance across different architectures and providers.

**Smart Caching**: Avoids redundant API calls by caching results, making iterative research and development significantly faster.

**Live Progress Tracking**: Real-time terminal UI showing evaluation progress, current accuracy metrics, and completion status for each model.

**Detailed Reporting**: Generates comprehensive markdown reports with confusion matrices, accuracy breakdowns, and per-model statistics.

**Concurrent Processing**: Configurable concurrency levels allow researchers to balance speed and API rate limits.

## Methodology

Checkmate FactBench uses the FEVER dataset, which contains claims extracted from Wikipedia articles and labeled as SUPPORTS, REFUTES, or NOT ENOUGH INFO. Each example includes:

- A **claim** to evaluate
- A **gold label** indicating the correct classification
- An optional **verifiability** flag

The tool prompts each model to classify the claim, then compares the output against the gold label. We measure:

- **Accuracy**: Percentage of correct classifications
- **Invalid Rate**: Percentage of responses that don't match expected format
- **Per-Class Performance**: Breakdown by SUPPORTS, REFUTES, and NOT ENOUGH INFO

## Initial Findings

Our initial evaluation across five models reveals significant variation in factual accuracy:

- **Model Performance**: Accuracy ranges from 60% to 85% depending on the model architecture
- **Format Consistency**: Some models struggle with structured output, leading to higher invalid rates
- **Class Imbalance**: Performance varies significantly across the three classification categories

These findings highlight the importance of systematic evaluation before deploying models in production fact-checking systems.

## Usage

Installation is straightforward:

\`\`\`bash
npm install -g checkmate-factbench
\`\`\`

After setting your OpenRouter API key, run evaluations with:

\`\`\`bash
checkmate-factbench --file val/train.jsonl --limit 50
\`\`\`

The tool supports custom model selection, output paths, and concurrency settings, making it adaptable to different research needs.

## Open Source Release

Checkmate FactBench is available as an open-source npm package under the MIT license. We believe that transparent, reproducible benchmarking is essential for advancing the field of automated fact-checking.

**Repository**: [github.com/MohtashamMurshid/checkmate-factbench](https://github.com/MohtashamMurshid/checkmate-factbench)

**Package**: [npmjs.com/package/checkmate-factbench](https://www.npmjs.com/package/checkmate-factbench)

## Future Work

We're actively expanding FactBench to include:

- Additional datasets beyond FEVER
- Support for retrieval-augmented evaluation
- Fine-grained error analysis and failure mode classification
- Integration with our production fact-checking pipeline

We welcome contributions from the research community to help improve the tool and expand its capabilities.

---

*Checkmate FactBench represents our commitment to building rigorous evaluation infrastructure for the fact-checking domain. By making benchmarking accessible and reproducible, we hope to accelerate progress toward more accurate automated verification systems.*

