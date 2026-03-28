import pytest
from app.graph.complaint_graph import create_complaint_graph
from app.graph.state import ComplaintState


@pytest.fixture
def complaint_graph():
    return create_complaint_graph()


@pytest.fixture
def sample_complaint_state():
    return ComplaintState(
        complaint_id="test-001",
        title="Test Complaint",
        description="This is a test complaint",
        category="general",
    )


def test_graph_initialization(complaint_graph):
    assert complaint_graph is not None


@pytest.mark.asyncio
async def test_complaint_processing(complaint_graph, sample_complaint_state):
    result = complaint_graph.invoke(sample_complaint_state)
    assert result.status == "completed"
    assert result.legal_analysis is not None
