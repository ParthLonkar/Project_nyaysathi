#!/usr/bin/env python3
"""Test script for the drafting agent"""

import asyncio
import json
from app.graph.state import ComplaintState
from app.agents import intake_agent, legal_agent, drafting_agent

async def test_drafting_agent():
    """Test the drafting agent with a sample complaint"""
    
    print("=" * 80)
    print("Testing Drafting Agent")
    print("=" * 80)
    
    # Create a sample complaint
    sample_complaint = {
        "title": "Noise Pollution in Residential Area",
        "description": """
        I am writing to lodge a formal complaint regarding excessive noise pollution 
        in my residential area. For the past three months, there has been continuous 
        construction work happening during restricted hours (6 PM to 6 AM), causing 
        severe disturbance to residents. The construction machinery operates without 
        proper noise barriers or soundproofing measures. This has caused health issues 
        including sleep deprivation and stress-related ailments for my family. Despite 
        multiple complaints to the local authorities, no action has been taken. 
        I request immediate intervention and imposition of hefty fines on the 
        construction company for violation of environmental regulations.
        """,
        "location": "Delhi, India",
        "category": "environmental"
    }
    
    print("\n📝 INPUT COMPLAINT:")
    print(f"Title: {sample_complaint['title']}")
    print(f"Description: {sample_complaint['description'][:200]}...")
    print(f"Location: {sample_complaint['location']}")
    
    try:
        # Initialize state
        initial_state = ComplaintState(
            complaint_id="test-complaint-001",
            title=sample_complaint["title"],
            description=sample_complaint["description"],
            category=sample_complaint["category"],
        )
        
        print("\n🔄 Processing through intake agent...")
        state = await intake_agent.process_intake(initial_state)
        print(f"✅ Intake processed - Category: {state.category}")
        
        print("\n🔄 Processing through legal agent...")
        state = await legal_agent.perform_legal_analysis(state)
        print(f"✅ Legal analysis completed")
        print(f"   Department: {state.legal_analysis.get('department', 'N/A')}")
        print(f"   Legal Strategy: {state.legal_analysis.get('legal_strategy', 'N/A')[:100]}...")
        
        print("\n🔄 Processing through drafting agent...")
        state = await drafting_agent.draft_document(state)
        print(f"✅ Drafting completed!")
        
        # Display results
        print("\n" + "=" * 80)
        print("📄 DRAFTING AGENT OUTPUT")
        print("=" * 80)
        
        print("\n1️⃣ COMPLAINT DRAFT:")
        print("-" * 80)
        if state.complaint_draft:
            print(state.complaint_draft[:500] + "...\n" if len(state.complaint_draft) > 500 else state.complaint_draft)
        else:
            print("❌ No complaint draft generated")
        
        print("\n2️⃣ RTI DRAFT:")
        print("-" * 80)
        if state.rti_draft:
            print(state.rti_draft[:500] + "...\n" if len(state.rti_draft) > 500 else state.rti_draft)
        else:
            print("❌ No RTI draft generated")
        
        print("\n3️⃣ IMPROVED TEXT:")
        print("-" * 80)
        if state.improved_text:
            print(state.improved_text[:500] + "...\n" if len(state.improved_text) > 500 else state.improved_text)
        else:
            print("❌ No improved text generated")
        
        print("\n4️⃣ LLM DRAFT (Full Legal Draft):")
        print("-" * 80)
        if state.draft_document:
            print(state.draft_document[:500] + "...\n" if len(state.draft_document) > 500 else state.draft_document)
        else:
            print("❌ No LLM draft generated")
        
        print("\n5️⃣ DOCUMENT VALIDATION:")
        print("-" * 80)
        print(f"Valid: {state.document_valid}")
        print(f"Notes: {state.document_notes}")
        
        print("\n6️⃣ AGENT FLOW STATUS:")
        print("-" * 80)
        agent_flow = state.legal_analysis.get("agent_flow", {})
        for stage, status in agent_flow.items():
            print(f"  {stage}: {status}")
        
        print("\n✅ DRAFTING AGENT TEST COMPLETED SUCCESSFULLY!\n")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR during drafting agent test:")
        print(f"   {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = asyncio.run(test_drafting_agent())
    exit(0 if success else 1)
