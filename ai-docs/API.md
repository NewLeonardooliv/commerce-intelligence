# API Documentation

Base URL: `http://localhost:3000/api/v1`

## Health Endpoints

### GET /health
Check API health status

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-21T10:00:00.000Z",
    "version": "1.0.0",
    "environment": "development",
    "uptime": 3600
  },
  "timestamp": "2024-01-21T10:00:00.000Z"
}
```

### GET /health/ready
Check if API is ready to accept requests

### GET /health/live
Check if API is alive

## Agents Endpoints

### POST /agents
Create a new AI agent

**Request Body:**
```json
{
  "name": "Sales Analyzer",
  "description": "Analyzes sales data and provides insights",
  "capabilities": ["data-analysis", "forecasting"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "agent-1234567890",
    "name": "Sales Analyzer",
    "description": "Analyzes sales data and provides insights",
    "capabilities": ["data-analysis", "forecasting"],
    "status": "idle",
    "createdAt": "2024-01-21T10:00:00.000Z",
    "updatedAt": "2024-01-21T10:00:00.000Z"
  },
  "message": "Agent created successfully",
  "timestamp": "2024-01-21T10:00:00.000Z"
}
```

### GET /agents
List all agents

### GET /agents/:id
Get agent by ID

### DELETE /agents/:id
Delete agent by ID

### POST /agents/tasks
Create a new task for an agent

**Request Body:**
```json
{
  "agentId": "agent-1234567890",
  "type": "data-analysis",
  "input": {
    "dataSet": "sales",
    "period": "30days"
  }
}
```

### GET /agents/tasks/:taskId
Get task by ID

### GET /agents/:id/tasks
List all tasks for a specific agent

## Analytics Endpoints

### POST /analytics/query
Query analytics data

**Request Body:**
```json
{
  "metrics": ["revenue", "orders", "conversion-rate"],
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "granularity": "day",
  "filters": {
    "category": "electronics"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": { ... },
    "results": [
      {
        "metric": "revenue",
        "data": [
          {
            "timestamp": "2024-01-01T00:00:00.000Z",
            "value": 15000,
            "metadata": {}
          }
        ],
        "summary": {
          "total": 450000,
          "average": 15000,
          "min": 10000,
          "max": 25000
        }
      }
    ],
    "generatedAt": "2024-01-21T10:00:00.000Z"
  },
  "timestamp": "2024-01-21T10:00:00.000Z"
}
```

### POST /analytics/insights
Generate AI-powered insights

**Request Body:**
```json
{
  "metrics": ["revenue", "customers"],
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "insight-1234567890",
      "type": "trend",
      "title": "Insight 1",
      "description": "Revenue has increased by 15% compared to last period",
      "severity": "medium",
      "metrics": ["revenue"],
      "confidence": 0.85,
      "createdAt": "2024-01-21T10:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-21T10:00:00.000Z"
}
```

### GET /analytics/metrics
Get available metrics and configurations

## Available Metrics

- `revenue`: Total revenue
- `orders`: Number of orders
- `customers`: Number of customers
- `conversion-rate`: Conversion rate percentage
- `average-order-value`: Average order value
- `customer-lifetime-value`: Customer lifetime value

## Available Capabilities

- `data-analysis`: Analyze data and extract patterns
- `pattern-recognition`: Identify patterns in data
- `forecasting`: Predict future trends
- `anomaly-detection`: Detect anomalies in data
- `recommendation`: Generate recommendations
- `sentiment-analysis`: Analyze sentiment in text data

## Time Granularities

- `hour`: Hourly data points
- `day`: Daily data points
- `week`: Weekly data points
- `month`: Monthly data points
- `year`: Yearly data points

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "timestamp": "2024-01-21T10:00:00.000Z"
}
```

### Common Error Codes

- `NOT_FOUND`: Resource not found (404)
- `VALIDATION_ERROR`: Validation failed (400)
- `UNAUTHORIZED`: Authentication required (401)
- `FORBIDDEN`: Insufficient permissions (403)
- `CONFLICT`: Resource conflict (409)
- `INTERNAL_SERVER_ERROR`: Server error (500)
